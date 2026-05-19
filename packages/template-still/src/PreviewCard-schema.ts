import { zColor } from "@remotion/zod-types";
import { z } from "zod";

const myCompSchema = z.object({
  title: z.string(),
  description: z.string(),
  color: zColor(),
});

