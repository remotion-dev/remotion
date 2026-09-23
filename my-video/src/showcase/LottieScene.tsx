import {Lottie, LottieAnimationData, getLottieMetadata} from "@remotion/lottie";
import {useEffect, useMemo, useState} from "react";
import {AbsoluteFill, cancelRender, continueRender, delayRender, staticFile, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

// Demonstrates: @remotion/lottie loading a Bodymovin/Lottie JSON via
// delayRender()/continueRender() (the guide's documented pattern), reading
// its dimensions/duration/framerate with getLottieMetadata(), and playing
// it in sync with Remotion's timeline. sample-lottie.json is a
// hand-authored two-shape animation (no lottiefiles.com fetch needed, since
// this sandbox has no network access) — see public/sample-lottie.json.
export const LottieScene: React.FC = () => {
  const {width} = useVideoConfig();
  const [handle] = useState(() => delayRender("Loading Lottie animation"));
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);

  useEffect(() => {
    fetch(staticFile("sample-lottie.json"))
      .then((data) => data.json())
      .then((json) => {
        setAnimationData(json);
        continueRender(handle);
      })
      .catch((err) => {
        cancelRender(err);
      });
  }, [handle]);

  const metadata = useMemo(() => (animationData ? getLottieMetadata(animationData) : null), [animationData]);

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins, justifyContent: "center", alignItems: "center"}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 26}}>
        @remotion/lottie · a hand-authored Bodymovin animation
      </div>
      {animationData ? <Lottie animationData={animationData} style={{width: 400, height: 400}} /> : null}
      {metadata ? (
        <div style={{color: palette.textDim, fontSize: 16, fontFamily: "monospace", marginTop: 8}}>
          getLottieMetadata(): {metadata.width}x{metadata.height} · {metadata.fps}fps · {metadata.durationInSeconds.toFixed(2)}s
        </div>
      ) : null}
      <div style={{position: "absolute", bottom: 56, width, textAlign: "center", color: palette.text, fontSize: 32, fontWeight: 600}}>
        Import any After Effects export, frame-accurate
      </div>
    </AbsoluteFill>
  );
};
