import { z } from "zod";
import { CompositionProps } from "./constants";

export const RenderRequest = z.object({
  id: z.string(),
  inputProps: CompositionProps,
});

export type RenderResponse =
  | {
      type: "error";
      message: string;
    }
  | {
      type: "done";
      url: string;
      size: number;
    };

export type SSEMessage =
  | { type: "log"; stream: "stdout" | "stderr"; data: string }
  | { type: "phase"; phase: string }
  | { type: "done"; url: string; size: number }
  | { type: "error"; message: string };
