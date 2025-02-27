import { AbsoluteFill } from "remotion";
import { RemixLetter } from "./remix-letter";

interface Props {
  horizontalOffset?: number;
}

export const RemixNotAnimated = ({ horizontalOffset }: Props) => {
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        left: `calc(16% + ${horizontalOffset}px)`,
        top: "7%",
        transform: "scale(1)",
      }}
    >
      <RemixLetter letterValue="R" marginLeft={0} marginTop={411} />
      <RemixLetter letterValue="e" marginLeft={82} marginTop={411} />
      <RemixLetter letterValue="m" marginLeft={149} marginTop={411} />
      <RemixLetter letterValue="i" marginLeft={257} marginTop={411} />
      <RemixLetter letterValue="x" marginLeft={290} marginTop={411} />
    </AbsoluteFill>
  );
};
