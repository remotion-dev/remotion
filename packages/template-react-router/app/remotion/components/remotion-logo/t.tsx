import { AbsoluteFill } from "remotion";

const d1 = "M1410 292L1410 509";

interface Props {
  marginLeft?: number;
  marginTop?: number;
  rotation?: number;
  scale?: number;
}

export const T = ({
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
        <path d={d1} stroke="black" strokeWidth="46" />
        <path
          d="M1410 358L1451 358"
          stroke="black"
          strokeWidth="46"
          strokeLinecap="round"
        />
      </svg>
    </AbsoluteFill>
  );
};
