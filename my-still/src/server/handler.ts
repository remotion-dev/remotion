import { Request, Response } from "express";
import pLimit from "p-limit";

// Only allow to process 1 image at a time
const limited = pLimit(1);

export const handler = (
  fn: (req: Request, res: Response) => Promise<unknown>,
) => {
  return async function (request: Request, response: Response): Promise<void> {
    try {
      await limited(() => fn(request, response));
    } catch (err) {
      console.log((err as Error).stack);
      response.set("content-type", "application/json");
      const statusCode = (err as { status: number }).status || 500;
      response.status(statusCode).json({
        success: false,
        error: (err as Error).message,
      });
    }
  };
};
