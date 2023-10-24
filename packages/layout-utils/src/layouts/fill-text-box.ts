import { measureText } from "./measure-text";

type Word = {
  text: string;
  fontFamily: string;
  fontWeight: string | number;
  fontSize: number;
};

export const fillTextBox = ({
  maxBoxWidth,
  maxLines
}: {
  maxBoxWidth: number;
  maxLines: number;
}) => {
  const lines: Word[][] = new Array(maxLines).fill(0).map(() => [] as Word[]);

  return {
    add: ({
      text,
      fontFamily,
      fontWeight,
      fontSize
    }: {
      text: string;
      fontFamily: string;
      fontWeight: string | number;
      fontSize: number;
    }): {
      exceedsBox: boolean;
      newLine: boolean;
    } => {
      const lastLineIndex = lines.reverse().findIndex(l => l.length > 0);
      const currentlyAt = lastLineIndex === -1 ? 0 : lastLineIndex;
      const lineToUse = lines[currentlyAt];

      const lineWithWord: Word[] = [
        ...lineToUse,
        { text, fontFamily, fontWeight, fontSize }
      ];

      const widths = lineWithWord.map(w => {
        return measureText(w).width;
      });
      const lineWidthWithWordAdded = widths.reduce((a, b) => a + b, 0);

      if (lineWidthWithWordAdded <= maxBoxWidth) {
        lines[currentlyAt].push({
          text: lines[currentlyAt].length === 0 ? text.trimStart() : text,
          fontFamily,
          fontWeight,
          fontSize
        });

        return { exceedsBox: false, newLine: false };
      }

      if (currentlyAt === maxLines - 1) {
        return { exceedsBox: true, newLine: false };
      }

      lines[currentlyAt + 1] = [
        { text: text.trimStart(), fontFamily, fontWeight, fontSize }
      ];
      return { exceedsBox: false, newLine: true };
    }
  };
};
