import { AbsoluteFill } from "remotion";
import { E } from "./e";
import { FirstO } from "./first-o";
import { I } from "./i";
import { M } from "./m";
import { N } from "./n";
import { R } from "./r";
import { SecondO } from "./second-o";
import { T } from "./t";

interface Props {
  horizontalOffset?: number;
}

export const RemotionNotAnimated = ({ horizontalOffset = 0 }: Props) => {
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        left: `calc(16% + ${horizontalOffset}px)`,
        top: "7%",
        transform: "scale(0.45)",
      }}
    >
      <R />
      <E />
      <M />
      <FirstO />
      <T />
      <I />
      <SecondO />
      <N />
    </AbsoluteFill>
  );
};
