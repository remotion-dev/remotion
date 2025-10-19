import { AbsoluteFill } from "remotion";
import { z } from "zod";

export const aiVideoSchema = z.object({});

export const AIVideo: React.FC<z.infer<typeof aiVideoSchema>> = () => {
  return <AbsoluteFill style={{ backgroundColor: "white" }}></AbsoluteFill>;
};
