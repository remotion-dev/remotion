import { test, expect } from "bun:test";
import { parseVideo } from "../parse-video";
import { exampleVideos } from "./example-videos";

test("Parse a video", async () => {
  const data = await parseVideo(exampleVideos.bigBuckBunny);
  expect(data).toEqual([
    {
      boxSize: 32,
      boxType: "ftyp",
      extraData: {
        type: "ftyp-box",
        majorBrand: "isom",
        minorVersion: 512,
        compatibleBrands: ["isom", "iso2", "avc1", "mp41"],
      },
    },
    {
      boxSize: 8,
      boxType: "free",
      extraData: undefined,
    },
    {
      boxSize: 14282275,
      boxType: "mdat",
      extraData: undefined,
    },
  ]);
});
