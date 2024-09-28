import { AbsoluteFill } from "remotion";

const d = `M630 508
V415
C630 383.52 655.52 358 687 358
h 16`;

interface Props {
  marginLeft?: number;
  marginTop?: number;
  rotation?: number;
  scale?: number;
}

export const R = ({
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
        <path d={d} strokeWidth="46" stroke="black" />
      </svg>
    </AbsoluteFill>
  );
};
