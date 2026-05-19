import { zColor } from "@remotion/zod-types";
import { z } from "zod";

const myCompSchema = z.object({
  phoneColor: zColor(),
  deviceType: z.enum(["phone", "tablet"]),
});

