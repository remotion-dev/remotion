import { AbsoluteFill } from "remotion";

const d =
  "M1771 485V415C1771 383.52 1796.52 358 1828 358V358C1859.48 358 1885 383.52 1885 415V485";

interface Props {
  marginLeft?: number;
  marginTop?: number;
  rotation?: number;
  scale?: number;
}

export const N = ({
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
        <path d={d} stroke="black" strokeWidth="46" strokeLinecap="square" />
      </svg>
    </AbsoluteFill>
  );
};
