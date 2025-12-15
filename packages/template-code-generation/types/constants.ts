import { z } from "zod";
export const COMP_NAME = "MyComp";

export const CompositionProps = z.object({
  title: z.string(),
});
