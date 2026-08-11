import {
  ALTERNATIVE1_PREFIX,
  ALTERNATIVE2_PREFIX,
  DISPLAY_PREFIX,
  WEBCAM_PREFIX,
} from "../../config/cameras";

export const prefixes = [
  WEBCAM_PREFIX,
  DISPLAY_PREFIX,
  ALTERNATIVE1_PREFIX,
  ALTERNATIVE2_PREFIX,
] as const;

export type Prefix = (typeof prefixes)[number];
