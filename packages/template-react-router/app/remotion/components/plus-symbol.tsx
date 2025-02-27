import { AbsoluteFill } from "remotion";

interface Props {
  verticalOffset?: number;
}

export const PlusSymbol = ({ verticalOffset = 0 }: Props) => {
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        top: `calc(42% + ${verticalOffset}px)`,
      }}
    >
      <span
        style={{
          fontSize: 130,
          fontFamily: "sans-serif",
        }}
      >
        +
      </span>
    </AbsoluteFill>
  );
};
