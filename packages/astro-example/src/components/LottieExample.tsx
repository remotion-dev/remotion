import { Lottie } from "@remotion/lottie";
import { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const Pumpkin = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const animationDelay = 1;
  const animationInput = frame - animationDelay;
  const animationOpacity = interpolate(
    animationInput,
    [0, 5, durationInFrames - 20, durationInFrames],
    [0, 1, 1, 0]
  );

  const [animationData, setAnimationData] = useState(null);
  const [handle] = useState(() => delayRender());

  useEffect(() => {
    // Credits: https://lottiefiles.com/37789-scary-halloween-pumpkin
    fetch("https://assets2.lottiefiles.com/packages/lf20_c5izbrx1.json")
      .then((res) => res.json())
      .then((data) => {
        setAnimationData(data);
        continueRender(handle);
      });
  }, [handle]);

  if (!animationData) {
    return null;
  }

  return (
    <AbsoluteFill style={{ opacity: animationOpacity }}>
      <Lottie animationData={animationData} />
    </AbsoluteFill>
  );
};
