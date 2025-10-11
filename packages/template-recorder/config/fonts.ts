import {
  loadFont as loadRegular,
  fontFamily as regularFont,
} from "@remotion/google-fonts/Inter";

import {
  loadFont as loadMonospace,
  fontFamily as monospaceFont,
} from "@remotion/google-fonts/RobotoMono";

import {
  fontFamily as endcardFont,
  loadFont as loadEndcard,
} from "@remotion/google-fonts/Inter";
import { cancelRender, continueRender, delayRender } from "remotion";

const regular = loadRegular();
const monospace = loadMonospace();
const endcard = loadEndcard();

export const waitForFonts = async () => {
  await regular.waitUntilDone();
  await monospace.waitUntilDone();
  await endcard.waitUntilDone();
};

export const REGULAR_FONT: React.CSSProperties = {
  fontFamily: regularFont,
  fontWeight: 600,
};

export const MONOSPACE_FONT: React.CSSProperties = {
  fontFamily: monospaceFont,
  fontWeight: 500,
  fontFeatureSettings: '"ss03" on',
};

export const TITLE_FONT: React.CSSProperties = {
  fontFamily: regularFont,
  fontWeight: 700,
};

export const ENDCARD_FONT: React.CSSProperties = {
  fontFamily: endcardFont,
  fontWeight: 500,
};

const delay = delayRender("Loading fonts");

waitForFonts()
  .then(() => continueRender(delay))
  .catch((err) => cancelRender(err));
