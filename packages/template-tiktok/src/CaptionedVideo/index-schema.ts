import { z } from "zod";

const captionedVideoSchema = z.object({
  src: z.string(),
});

