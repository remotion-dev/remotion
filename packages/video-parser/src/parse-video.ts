import { createReadStream } from "fs";
import type { MvhdBox } from "./boxes/iso-base-media/mvhd";
import { parseMvhd } from "./boxes/iso-base-media/mvhd";

const fourByteToNumber = (data: Buffer, from: number) => {
  return (
    (data[from + 0] << 24) |
    (data[from + 1] << 16) |
    (data[from + 2] << 8) |
    data[from + 3]
  );
};

type ExtraData =
  | {
      type: "ftyp-box";
      majorBrand: string;
      minorVersion: number;
      compatibleBrands: string[];
    }
  | {
      type: "boxes";
      boxes: Box[];
    }
  | {
      type: "mvhd-box";
      box: MvhdBox;
    };

export type Box = {
  boxType: string;
  boxSize: number;
  extraData: ExtraData | undefined;
  offset: number;
};

const getExtraDataFromBox = (
  box: Buffer,
  type: string
): ExtraData | undefined => {
  if (type === "ftyp") {
    return parseFtyp(box);
  }

  if (type === "mvhd") {
    return { type: "mvhd-box", box: parseMvhd(box) };
  }

  if (
    type === "moov" ||
    type === "trak" ||
    type === "mdia" ||
    type === "minf" ||
    type === "stbl" ||
    type === "stsb"
  ) {
    return parseBoxes(box.subarray(8));
  }
};

const processBoxAndSubtract = (data: Buffer, offset: number): BoxAndNext => {
  const boxSize = fourByteToNumber(data, 0);
  const boxType = data.subarray(4, 8).toString("utf-8");

  const next = data.subarray(boxSize);

  return {
    next,
    boxType,
    boxSize,
    extraData: getExtraDataFromBox(data.subarray(0, boxSize), boxType),
    offset: offset + boxSize,
  };
};

type BoxAndNext = Box & {
  next: Buffer;
};

const isoBaseMediaMp4Pattern = Buffer.from("ftyp");

const parseBoxes = (data: Buffer): ExtraData => {
  const boxes: Box[] = [];
  let remaining = data;
  let bytesConsumed = 0;
  while (remaining.length > 0) {
    const { next, boxType, boxSize, extraData, offset } = processBoxAndSubtract(
      remaining,
      bytesConsumed
    );
    remaining = next;
    boxes.push({ boxType, boxSize, extraData, offset: bytesConsumed });
    bytesConsumed = offset;
  }

  return { boxes, type: "boxes" };
};

const parseFtyp = (data: Buffer): ExtraData => {
  const majorBrand = data.subarray(8, 12).toString("utf-8").trim();

  const minorVersion = fourByteToNumber(data, 12);

  const rest = data.subarray(16);
  const types = rest.length / 4;
  const compatibleBrands: string[] = [];
  for (let i = 0; i < types; i++) {
    const fourBytes = rest.subarray(i * 4, i * 4 + 4);
    compatibleBrands.push(fourBytes.toString("utf-8").trim());
  }

  return {
    type: "ftyp-box",
    majorBrand,
    minorVersion,
    compatibleBrands,
  };
};

const matchesPattern = (pattern: Buffer) => {
  return (data: Buffer) => {
    return pattern.every((value, index) => data[index] === value);
  };
};

export const parseVideo = async (src: string, bytes: number) => {
  const stream = createReadStream(
    src,
    Number.isFinite(bytes) ? { end: bytes - 1 } : {}
  );
  const data = await new Promise<Buffer>((resolve, reject) => {
    stream.on("data", (chunk) => {
      resolve(chunk as Buffer);
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });

  if (matchesPattern(isoBaseMediaMp4Pattern)(data.subarray(4, 8))) {
    const boxes = parseBoxes(data);
    if (boxes.type === "boxes") {
      return boxes.boxes;
    }
  }
};
