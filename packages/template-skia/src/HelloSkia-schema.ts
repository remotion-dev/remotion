import { zColor } from "@remotion/zod-types";
import { z } from "zod";

const helloSkiaSchema = z.object({
  color1: zColor(),
  color2: zColor(),
});

