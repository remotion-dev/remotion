import {zColor} from "@remotion/zod-types";
import {z} from "zod";

export const myCompSchema2 = z.object({
  logoColor1: zColor(),
  logoColor2: zColor(),
});
