import { z } from "zod";
import { TimelineSchema } from "../lib/types";

const aiVideoSchema = z.object({
  timeline: TimelineSchema.nullable(),
});

