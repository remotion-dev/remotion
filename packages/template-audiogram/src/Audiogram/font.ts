import { fontFamily, loadFont } from "@remotion/google-fonts/IBMPlexSans";

const loading = loadFont("normal", {
  weights: ["500", "600"],
});

export const FONT_FAMILY = fontFamily;

export const waitForFonts = async () => {
  await loading.waitUntilDone();
};
