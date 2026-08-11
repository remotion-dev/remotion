import { loadFont } from "@remotion/google-fonts/RobotoMono";

export const { fontFamily, waitUntilDone } = loadFont("normal", {
  subsets: ["latin"],
  weights: ["400", "700"],
});
export const fontSize = 40;
export const tabSize = 3;
export const horizontalPadding = 60;
export const verticalPadding = 84;
