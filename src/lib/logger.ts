import morgan from "morgan";
import { Request, Response, NextFunction } from "express";
import { nanoid } from "nanoid";

export function requestId(req: Request, _res: Response, next: NextFunction) {
  (req as any).id = (req.headers["x-request-id"] as string) || nanoid();
  next();
}

export const logger = morgan(":method :url :status :res[content-length] - :response-time ms reqId=:req[id]", {
  stream: {
    write: (str) => process.stdout.write(str),
  },
});
