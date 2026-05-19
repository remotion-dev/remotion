import { z } from "zod";
import { zColor } from "@remotion/zod-types";

const helloWorldCompSchema = z.object({
  titleText: z.string(),
  titleColor: zColor(),
  logoColor1: zColor(),
  logoColor2: zColor(),
});

