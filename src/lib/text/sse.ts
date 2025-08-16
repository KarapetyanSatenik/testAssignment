import { Response } from "express";

export interface SSEWriter {
  send: (data: unknown) => void;
  close: () => void;
}

export function initSSE(res: Response): SSEWriter {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  function send(obj: unknown) {
    res.write(`data: ${JSON.stringify(obj)}\n\n`);
  }
  function close() {
    res.end();
  }
  return { send, close };
}
