import { continueRender, delayRender, staticFile } from "remotion";

export const loadFonts = async () => {
  const waitForGroteskFont = delayRender("groteskFont");
  const groteskFont = new FontFace(
    `Founders Grotesk`,
    `url(${staticFile("fonts/FoundersGrotesk-Bold.woff2")}) format('woff2')`,
    { weight: "700" },
  );

  groteskFont
    .load()
    .then(() => {
      document.fonts.add(groteskFont);
      continueRender(waitForGroteskFont);
    })
    .catch((err) => console.log("Error loading font", err));
};
