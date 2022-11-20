export const BACKGROUND = "#16181D";
import { continueRender, delayRender, staticFile } from "remotion";
if (typeof window !== "undefined" && "FontFace" in window) {
  const font = new FontFace(
    "Cubano",
    "url(" + staticFile("/fonts/Cubano.woff") + ") format('woff')"
  );
  const handle = delayRender();
  font.load().then(() => {
    document.fonts.add(font);
    continueRender(handle);
  });
}

export const getFont = () => null;

