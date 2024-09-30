import { AbsoluteFill } from "remotion";
import { Triangle } from "./triangle";

interface Props {
  size: number;
  color?: string;
}

export const RemotionLogo = ({ size, color = "#0B84F3" }: Props) => {
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Triangle color={color} size={size} opacity={0.2} />
      <Triangle color={color} size={(size * 9) / 11} opacity={0.4} />
      <Triangle color={color} size={(size * 7) / 11} opacity={1} />
    </AbsoluteFill>
  );
};
