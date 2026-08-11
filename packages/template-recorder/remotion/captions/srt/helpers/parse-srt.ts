export type ParsedSrtLine = {
  index: number;
  text: string;
  startInSeconds: number;
  endInSeconds: number;
};

export type ParsedSrt = ParsedSrtLine[];

function toSeconds(time: string) {
  const [first, second, third] = time.split(":");
  if (!first) {
    throw new Error(`Invalid timestamp:${time}`);
  }
  if (!second) {
    throw new Error(`Invalid timestamp:${time}`);
  }
  if (!third) {
    throw new Error(`Invalid timestamp:${time}`);
  }

  const [seconds, millis] = third.split(",");
  if (!seconds) {
    throw new Error(`Invalid timestamp:${time}`);
  }
  if (!millis) {
    throw new Error(`Invalid timestamp:${time}`);
  }

  return (
    parseInt(first, 10) * 3600 +
    parseInt(second, 10) * 60 +
    parseInt(seconds, 10) +
    parseInt(millis, 10) / 1000
  );
}

export const parseSrt = (input: string): ParsedSrt => {
  const inputLines = input.split("\n");
  const lines: ParsedSrtLine[] = [];

  for (let i = 0; i < inputLines.length; i++) {
    const line = inputLines[i];
    const nextLine = inputLines[i + 1];
    if (line?.match(/([0-9]+)/) && nextLine?.includes(" --> ")) {
      const nextLineSplit = nextLine.split(" --> ");
      const start = toSeconds(nextLineSplit[0] as string);
      const end = toSeconds(nextLineSplit[1] as string);
      lines.push({
        index: Number(line),
        text: "",
        startInSeconds: start,
        endInSeconds: end,
      });
    } else if (line?.includes(" --> ")) {
      continue;
    } else if (line?.trim() === "") {
      (lines[lines.length - 1] as ParsedSrtLine).text = (
        lines[lines.length - 1] as ParsedSrtLine
      ).text.trim();
    } else {
      (lines[lines.length - 1] as ParsedSrtLine).text += line + "\n";
    }
  }

  return lines;
};
