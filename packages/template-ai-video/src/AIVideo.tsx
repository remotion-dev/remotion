import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { TimelineSchema } from "./types";

export const aiVideoSchema = z.object({
  timeline: TimelineSchema,
  hasWatermark: z.boolean().optional(),
});

export const AIVideo: React.FC<z.infer<typeof aiVideoSchema>> = ({
  timeline,
  hasWatermark,
}) => {
  return <AbsoluteFill style={{ backgroundColor: "white" }}></AbsoluteFill>;
};
