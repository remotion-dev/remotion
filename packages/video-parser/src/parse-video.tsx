import { createReadStream } from "fs";

const fourByteToNumber = (data: Buffer, from: number) => {
  return (
    (data[from + 0] << 24) |
    (data[from + 1] << 16) |
    (data[from + 2] << 8) |
    data[from + 3]
  );
};

type Box = {
  next: Buffer;
  boxType: string;
  boxSize: number;
  extraData: unknown | null;
};

const isoBaseMediaMp4Pattern = Buffer.from("ftyp");

const parseBoxes = (data: Buffer) => {
  let boxes = [];
  let remaining = data;
  while (remaining.length > 0) {
    const { next, boxType, boxSize, extraData } =
      processBoxAndSubtract(remaining);
    remaining = next;
    boxes.push({ boxType, boxSize, extraData });
  }
  return boxes;
};

const parseFtyp = (data: Buffer) => {
  const majorBrand = data.subarray(8, 12).toString("utf-8").trim();

  const minorVersion = fourByteToNumber(data, 12);

  const rest = data.subarray(16);
  let types = rest.length / 4;
  let compatibleBrands: string[] = [];
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

const parseMoov = (data: Buffer) => {
  return parseBoxes(data);
};

const getExtraDataFromBox = (box: Buffer, type: string) => {
  if (type === "ftyp") {
    return parseFtyp(box);
  }
  if (type === "moov") {
    return parseMoov(box.subarray(8));
  }
  return;
};

const processBoxAndSubtract = (data: Buffer): Box => {
  const boxSize = fourByteToNumber(data, 0);
  const boxType = data.subarray(4, 8).toString("utf-8");

  const next = data.subarray(boxSize);

  return {
    next,
    boxType,
    boxSize,
    extraData: getExtraDataFromBox(data.subarray(0, boxSize), boxType),
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
    return parseBoxes(data);
  }
};
