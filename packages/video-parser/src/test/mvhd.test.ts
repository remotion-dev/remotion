import { test, expect } from "bun:test";
import { parseMvhd } from "../boxes/iso-base-media/mvhd";

test("Should be able to parse a MVHD box correctly", () => {
  const buffer = Buffer.from([
    // size, 32 bit
    0, 0, 0, 108,
    // mvhd atom, 32 bit
    109, 118, 104, 100,
    // version, 8 unsigned bit
    0,
    // flags
    0, 0, 0,
    // creation time
    0, 0, 0, 0,
    // modification time
    0, 0, 0, 0,
    // time scale
    0, 0, 3, 232,
    // duration
    0, 0, 16, 71,
    // rate
    0, 1, 0, 0,
    // volume
    1, 0,
    // reserved 16 bit
    0, 0,
    // reserved 32 bit [0]
    0, 0, 0, 0,
    // reserved 32 bit [1]
    0, 0, 0, 0,
    // matrix [0]
    0, 1, 0, 0,
    // matrix [1]
    0, 0, 0, 0,
    // matrix [2]
    0, 0, 0, 0,
    // matrix [3]
    0, 0, 0, 0,
    // matrix [4]
    0, 1, 0, 0,
    // matrix [5]
    0, 0, 0, 0,
    // matrix [6]
    0, 0, 0, 0,
    // matrix [7]
    0, 0, 0, 0,
    // matrix [8]
    64, 0, 0, 0,
    // predefined [0]
    0, 0, 0, 0,
    // predefined [1]
    0, 0, 0, 0,
    // predefined [2]
    0, 0, 0, 0,
    // predefined [3]
    0, 0, 0, 0,
    // predefined [4]
    0, 0, 0, 0,
    // predefined [5]
    0, 0, 0, 0,
    // next track id
    0, 0, 0, 2,
  ]);

  const mvhd = parseMvhd(buffer);
  expect(mvhd).toEqual({
    creationTime: null,
    modificationTime: null,
    timeScale: 1000,
    durationInUnits: 4167,
    durationInSeconds: 4.167,
    rate: 1,
    volume: 1,
    matrix: [65536, 0, 0, 0, 65536, 0, 0, 0, 1073741824],
    nextTrackId: 2,
  });
});
