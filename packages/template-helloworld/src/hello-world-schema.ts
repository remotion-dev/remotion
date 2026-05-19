import {zColor} from "@remotion/zod-types";
import {z} from "zod";

export const myCompSchema = z.object({
  titleText: z.string(),
  titleColor: zColor(),
  logoColor1: zColor(),
  logoColor2: zColor(),
});
