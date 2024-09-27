import { continueRender, delayRender, staticFile } from "remotion";

export const TheBoldFont = `TheBoldFont`;

let loaded = false;

export const loadFont = async (): Promise<void> => {
  if (loaded) {
    return Promise.resolve();
  }

  const waitForFont = delayRender();

  loaded = true;

  const font = new FontFace(
    TheBoldFont,
    `url('${staticFile("theboldfont.ttf")}') format('truetype')`,
  );

  await font.load();
  document.fonts.add(font);

  continueRender(waitForFont);
};
