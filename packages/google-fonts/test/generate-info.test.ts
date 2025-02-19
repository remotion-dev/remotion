import { test, expect } from "bun:test";
import { extractInfoFromCss } from "../scripts/extract-info-from-css";

const testFile = `
/* latin-ext */
@font-face {
  font-family: 'ABeeZee';
  font-style: italic;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/abeezee/v22/esDT31xSG-6AGleN2tCUnJ8DKpE.woff2) format('woff2');
  unicode-range: U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* latin */
@font-face {
  font-family: 'ABeeZee';
  font-style: italic;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/abeezee/v22/esDT31xSG-6AGleN2tCUkp8D.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
/* latin-ext */
@font-face {
  font-family: 'ABeeZee';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/abeezee/v22/esDR31xSG-6AGleN2tukkIcH.woff2) format('woff2');
  unicode-range: U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* latin */
@font-face {
  font-family: 'ABeeZee';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/abeezee/v22/esDR31xSG-6AGleN2tWkkA.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
`;

test("Should extract correctly", () => {
  const data = extractInfoFromCss({
    contents: testFile,
    fontFamily: "ABeeZee",
    importName: "ABeeZee",
    url: "https://fonts.googleapis.com/css2?family=ABeeZee:ital,wght@0,400;1,400",
    version: "v22",
  });
  expect(data).toEqual({
    fontFamily: "ABeeZee",
    importName: "ABeeZee",
    version: "v22",
    url: "https://fonts.googleapis.com/css2?family=ABeeZee:ital,wght@0,400;1,400",
    unicodeRanges: {
      "latin-ext":
        "U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
      latin:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
    fonts: {
      italic: {
        "400": {
          "latin-ext":
            "https://fonts.gstatic.com/s/abeezee/v22/esDT31xSG-6AGleN2tCUnJ8DKpE.woff2",
          latin:
            "https://fonts.gstatic.com/s/abeezee/v22/esDT31xSG-6AGleN2tCUkp8D.woff2",
        },
      },
      normal: {
        "400": {
          "latin-ext":
            "https://fonts.gstatic.com/s/abeezee/v22/esDR31xSG-6AGleN2tukkIcH.woff2",
          latin:
            "https://fonts.gstatic.com/s/abeezee/v22/esDR31xSG-6AGleN2tWkkA.woff2",
        },
      },
    },
  });
});
