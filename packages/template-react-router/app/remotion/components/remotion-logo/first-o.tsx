import { AbsoluteFill } from "remotion";

interface Props {
  marginLeft?: number;
  marginTop?: number;
  rotation?: number;
  scale?: number;
}

export const FirstO = ({
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
        <g>
          <rect
            x={1216}
            y={359}
            width={126}
            height={126}
            stroke="black"
            strokeWidth={46}
            rx={63}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
