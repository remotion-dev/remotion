import { AbsoluteFill } from "remotion";

const p1 = "M1511 335 L1511 508";

interface Props {
  marginLeft?: number;
  marginTop?: number;
  rotation?: number;
  scale?: number;
}

export const I = ({
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
          <circle cx="1510.5" cy="293.5" r="22" fill="currentcolor" />
          <path d={p1} stroke="currentcolor" strokeWidth="46" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
