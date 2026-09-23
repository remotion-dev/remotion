import {Lottie, LottieAnimationData, getLottieMetadata} from "@remotion/lottie";
import {useEffect, useMemo, useState} from "react";
import {AbsoluteFill, staticFile, useDelayRender, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

// Demonstrates: @remotion/lottie loading a Bodymovin/Lottie JSON via
// delayRender()/continueRender() (the guide's documented pattern, taken from
// the scoped useDelayRender() hook the core docs recommend), reading
// its dimensions/duration/framerate with getLottieMetadata(), and playing
// it in sync with Remotion's timeline. sample-lottie.json is a
// hand-authored two-shape animation (no lottiefiles.com fetch needed, since
// this sandbox has no network access) — see public/sample-lottie.json.
export const LottieScene: React.FC = () => {
  const {width} = useVideoConfig();
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender("Loading Lottie animation"));
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);
  const [loaded, setLoaded] = useState<{totalFrames: number; frameRate: number} | null>(null);

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
  }, [handle, continueRender, cancelRender]);

  const metadata = useMemo(() => (animationData ? getLottieMetadata(animationData) : null), [animationData]);

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins, justifyContent: "center", alignItems: "center"}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 26}}>
        @remotion/lottie · a hand-authored Bodymovin animation
      </div>
      {animationData ? (
        <Lottie
          animationData={animationData}
          style={{width: 400, height: 400}}
          // Played backwards at 1.5x, looping, drawn to a <canvas> instead of SVG.
          direction="backward"
          playbackRate={1.5}
          loop
          renderer="canvas"
          onAnimationLoaded={(animation) => setLoaded({totalFrames: animation.totalFrames, frameRate: animation.frameRate})}
        />
      ) : null}
      {/* Only what the callback reports. It fires before <Lottie> applies
          direction/playbackRate, so reading those back here would show defaults. */}
      {loaded === null ? null : (
        <div style={{color: palette.textDim, fontSize: 16, fontFamily: "monospace", marginTop: 8}}>
          onAnimationLoaded(): {loaded.totalFrames} frames @ {loaded.frameRate}fps
        </div>
      )}
      <div style={{color: palette.textDim, fontSize: 16, fontFamily: "monospace", marginTop: 8}}>
        props: direction=&quot;backward&quot; · playbackRate=1.5 · loop · renderer=&quot;canvas&quot;
      </div>
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
