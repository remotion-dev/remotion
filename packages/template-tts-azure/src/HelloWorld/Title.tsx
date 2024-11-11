import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Title: React.FC<{
  text: string;
  titleColor: string;
  displaySpeed: number;
}> = ({ text, titleColor, displaySpeed }) => {
  const videoConfig = useVideoConfig();
  const frame = useCurrentFrame();
  const rawText = text.split(" ").map((t) => ` ${t} `);

  return (
    <>
      <h1
        style={{
          fontFamily: "SF Pro Text, Helvetica, Arial",
          fontWeight: "bold",
          fontSize: 100,
          textAlign: "center",
          position: "absolute",
          bottom: 160,
          width: "100%",
        }}
      >
        {rawText.map((t, i) => {
          return (
            <span
              key={i + t}
              style={{
                color: titleColor,
                marginLeft: 10,
                marginRight: 10,
                transform: `scale(${spring({
                  fps: videoConfig.fps,
                  frame: frame - i * displaySpeed,
                  config: {
                    damping: 100,
                    stiffness: 200,
                    mass: 0.5,
                  },
                })})`,
                display: "inline-block",
              }}
            >
              {t}
            </span>
          );
        })}
      </h1>
    </>
  );
};
