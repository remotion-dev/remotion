import { R } from "./r";

interface Props {
  letterValue: string;
  marginLeft?: number;
  marginTop?: number;
  rotation?: number;
  scale?: number;
}

export const RemixLetter = ({
  letterValue,
  marginLeft = 0,
  marginTop = 0,
  rotation = 0,
  scale = 1,
}: Props) => {
  return (
    <div
      style={{
        position: "absolute",
        left: marginLeft,
        top: marginTop,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: "center",
      }}
    >
      {letterValue === "R" ? (
        <R />
      ) : (
        <span
          style={{
            fontSize: 130,
            color: "black",
            fontFamily: "Founders Grotesk,sans-serif",
            fontWeight: 700,
          }}
        >
          {letterValue}
        </span>
      )}
    </div>
  );
};
