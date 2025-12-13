import { RemotionExample } from "./index";

export const lottieAnimationCode = `import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Lottie } from "@remotion/lottie";
import { useState, useEffect } from "react";

export const MyAnimation = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("https://assets-v2.lottiefiles.com/a/73ecc94a-4ccb-4018-a710-835b9eaffeaf/OwGeQT8PCr.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Failed to load Lottie:", err));
  }, []);

  const entrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const scale = interpolate(entrance, [0, 1], [0.5, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  if (!animationData) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#000000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ color: "#94a3b8", fontSize: 24, fontFamily: "system-ui" }}>
          Loading animation...
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: \`scale(\${scale})\`,
          opacity,
        }}
      >
        <Lottie
          animationData={animationData}
          style={{ width: 400, height: 400 }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 60,
          color: "#e2e8f0",
          fontSize: 24,
          fontFamily: "system-ui",
          opacity,
          textAlign: "center",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 4 }}>Glowing Fish Loader</div>
        <div style={{ fontSize: 16, color: "#94a3b8" }}>by Mau Ali on LottieFiles</div>
      </div>
    </AbsoluteFill>
  );
};`;

export const lottieAnimationExample: RemotionExample = {
  id: "lottie-animation",
  name: "Lottie Fish Loader",
  description: "Glowing fish loader animation from LottieFiles",
  category: "Animation",
  durationInFrames: 180,
  fps: 60,
  code: lottieAnimationCode,
};
