import { test, expect } from "bun:test";
import { parseVideo } from "../parse-video";
import { exampleVideos } from "./example-videos";

test("Parse Big Buck bunny", async () => {
  const data = await parseVideo(exampleVideos.bigBuckBunny, 4 * 1024);
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

test("Parse an iPhone video", async () => {
  const data = await parseVideo(exampleVideos.iphonevideo, 4 * 1024);
  expect(data).toEqual([
    {
      boxSize: 20,
      boxType: "ftyp",
      extraData: {
        type: "ftyp-box",
        majorBrand: "qt",
        minorVersion: 0,
        compatibleBrands: ["qt"],
      },
    },
    { boxType: "wide", boxSize: 8, extraData: undefined },

    {
      boxSize: 39048800,
      boxType: "mdat",
      extraData: undefined,
    },
  ]);
});

test("Parse framer", async () => {
  const parsed = await parseVideo(
    exampleVideos.framerWithoutFileExtension,
    4 * 1024
  );
  expect(parsed).toEqual([
    {
      boxSize: 32,
      boxType: "ftyp",
      extraData: {
        compatibleBrands: ["isom", "iso2", "avc1", "mp41"],
        majorBrand: "isom",
        minorVersion: 512,
        type: "ftyp-box",
      },
    },
    {
      boxSize: 8,
      boxType: "free",
      extraData: undefined,
    },
    {
      boxSize: 73010,
      boxType: "mdat",
      extraData: undefined,
    },
  ]);
});

test("Parse a full video", async () => {
  const data = await parseVideo(exampleVideos.framer24fps, Infinity);
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
    { boxType: "free", boxSize: 8, extraData: undefined },
    {
      boxSize: 57014,
      boxType: "mdat",
      extraData: undefined,
    },
    {
      boxSize: 1929,
      boxType: "moov",
      extraData: undefined,
    },
  ]);
});
