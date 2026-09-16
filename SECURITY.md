# HyperZip Security & Privacy Architecture

## 1. Zero-Knowledge Threat Model

HyperZip operates under a strict client-side guarantee:
- **No Cloud Upload**: Files selected by the user are never transmitted over HTTP/WebSocket to any server.
- **No Remote Telemetry of File Contents**: Local telemetry only tracks aggregate metrics (e.g. throughput MB/s, ratio) in browser `localStorage`.
- **No Accounts Required**: No cookies, session tokens, or authentication credentials.
- **Sandboxed Execution**: Compression runs entirely within browser-sandboxed Web Workers.

---

## 2. File System Access Safety

HyperZip utilizes explicit user approvals via:
- `showOpenFilePicker()`
- `showSaveFilePicker()`
- `<input type="file" webkitdirectory>`

HyperZip never writes to arbitrary system directories without the user selecting the destination.
Temporary spooling is restricted to origin-private storage (`OPFS`), which is isolated per browser origin.
