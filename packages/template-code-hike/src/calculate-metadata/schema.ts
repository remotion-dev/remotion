import { z } from "zod";
import { themeSchema } from "./theme";

export const width = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("auto"),
  }),
  z.object({
    type: z.literal("fixed"),
    value: z.number().step(1),
  }),
]);

export const schema = z.object({
  theme: themeSchema,
  width,
});
