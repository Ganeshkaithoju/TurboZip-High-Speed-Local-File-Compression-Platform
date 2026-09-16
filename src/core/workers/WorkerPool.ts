import { WorkerTask, WorkerResponse } from '../types/engine';

interface PoolWorker {
  id: number;
  worker: Worker;
  busy: boolean;
  activeTask?: WorkerTask;
}

interface QueuedTask {
  task: WorkerTask;
  transfer: Transferable[];
  resolve: (res: WorkerResponse) => void;
  reject: (err: any) => void;
}

export class WorkerPool {
  private workers: PoolWorker[] = [];
  private taskQueue: QueuedTask[] = [];
  private poolSize: number;
  private isTerminated = false;
  private onWorkerActivity?: (workerId: number, busy: boolean, filename?: string) => void;

  constructor(requestedWorkers?: number, onActivity?: (workerId: number, busy: boolean, filename?: string) => void) {
    const hardware = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4;
    // Reserve 1-2 cores for UI responsiveness
    const defaultWorkers = Math.max(1, Math.min(hardware - 1, 8));
    this.poolSize = requestedWorkers && requestedWorkers > 0 ? requestedWorkers : defaultWorkers;
    this.onWorkerActivity = onActivity;
    this.initWorkers();
  }

  private initWorkers(): void {
    for (let i = 0; i < this.poolSize; i++) {
      try {
        const worker = new Worker(
          new URL('./compression.worker.ts', import.meta.url),
          { type: 'module' }
        );

        const poolWorker: PoolWorker = {
          id: i + 1,
          worker,
          busy: false,
        };

        this.workers.push(poolWorker);
      } catch (e) {
        console.error(`Failed to initialize worker ${i + 1}`, e);
      }
    }
  }

  public getWorkerCount(): number {
    return this.workers.length;
  }

  public getActiveCount(): number {
    return this.workers.filter((w) => w.busy).length;
  }

  public setWorkerActivityListener(listener: (workerId: number, busy: boolean, filename?: string) => void) {
    this.onWorkerActivity = listener;
  }

  public execute(task: WorkerTask, transfer: Transferable[]): Promise<WorkerResponse> {
    if (this.isTerminated) {
      return Promise.reject(new Error('WorkerPool is terminated'));
    }

    return new Promise<WorkerResponse>((resolve, reject) => {
      this.taskQueue.push({ task, transfer, resolve, reject });
      this.dispatchAllAvailable();
    });
  }

  private dispatchAllAvailable(): void {
    if (this.isTerminated || this.taskQueue.length === 0) return;

    while (this.taskQueue.length > 0) {
      const availableWorker = this.workers.find((w) => !w.busy);
      if (!availableWorker) break;

      const queued = this.taskQueue.shift();
      if (!queued) break;

      this.runTaskOnWorker(availableWorker, queued);
    }
  }

  private runTaskOnWorker(workerRef: PoolWorker, queued: QueuedTask): void {
    const { task, transfer, resolve, reject } = queued;
    workerRef.busy = true;
    workerRef.activeTask = task;

    if (this.onWorkerActivity) {
      this.onWorkerActivity(workerRef.id, true, task.filename);
    }

    const messageHandler = (event: MessageEvent<WorkerResponse>) => {
      cleanup();
      workerRef.busy = false;
      workerRef.activeTask = undefined;
      if (this.onWorkerActivity) {
        this.onWorkerActivity(workerRef.id, false);
      }
      resolve(event.data);
      this.dispatchAllAvailable();
    };

    const errorHandler = (err: ErrorEvent) => {
      cleanup();
      workerRef.busy = false;
      workerRef.activeTask = undefined;
      if (this.onWorkerActivity) {
        this.onWorkerActivity(workerRef.id, false);
      }
      reject(new Error(err.message || 'Worker task execution failed'));
      this.dispatchAllAvailable();
    };

    const cleanup = () => {
      workerRef.worker.removeEventListener('message', messageHandler);
      workerRef.worker.removeEventListener('error', errorHandler);
    };

    workerRef.worker.addEventListener('message', messageHandler);
    workerRef.worker.addEventListener('error', errorHandler);

    try {
      workerRef.worker.postMessage(task, transfer);
    } catch (e) {
      cleanup();
      workerRef.busy = false;
      reject(e);
      this.dispatchAllAvailable();
    }
  }

  public cancelPending(): void {
    while (this.taskQueue.length > 0) {
      const item = this.taskQueue.shift();
      item?.reject(new Error('Task cancelled'));
    }
  }

  public terminateAll(): void {
    this.isTerminated = true;
    this.cancelPending();
    for (const w of this.workers) {
      w.worker.terminate();
    }
    this.workers = [];
  }
}
