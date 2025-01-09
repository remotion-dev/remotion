import { AbsoluteFill } from "remotion";

interface Props {
  marginLeft?: number;
  marginTop?: number;
  rotation?: number;
  scale?: number;
}

export const SecondO = ({
  marginLeft = 0,
  marginTop = 0,
  rotation = 0,
  scale = 1,
}: Props) => {
  return (
    <AbsoluteFill
      style={{
        marginLeft,
        marginTop,
        transform: `rotate(${rotation}deg) scale(${scale})`,
      }}
    >
      <svg
        viewBox="0 0 2100 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x={1642.5 - 126 / 2}
          y={421.5 - 126 / 2}
          width={126}
          height={126}
          stroke="currentcolor"
          strokeWidth={46}
          rx={63}
        />
      </svg>
    </AbsoluteFill>
  );
};
