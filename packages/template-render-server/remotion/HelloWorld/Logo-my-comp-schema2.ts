import { z } from "zod";
import { zColor } from "@remotion/zod-types";

const myCompSchema2 = z.object({
  logoColor1: zColor(),
  logoColor2: zColor(),
});

