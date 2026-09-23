import {AnimatedEmoji} from "@remotion/animated-emoji";
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

// Demonstrates: @remotion/animated-emoji — Google Fonts' animated emoji as
// a <Loop>+<OffthreadVideo transparent> component. Fully self-hosted: no
// runtime fetch from any CDN, unlike @remotion/google-fonts. The video
// files aren't bundled with the npm package itself (by design, to keep it
// small) — copy the ones you need, once, from remotion-dev/animated-emoji's
// public/ folder on GitHub into this project's public/. star-struck-0.5x
// (mp4+webm, ~750KB) was copied in that way for this scene.
export const AnimatedEmojiScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const scale = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins, justifyContent: "center", alignItems: "center"}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 26}}>
        @remotion/animated-emoji · self-hosted, no CDN at render time
      </div>
      <div style={{transform: `scale(${scale})`, width: 260, height: 260}}>
        <AnimatedEmoji emoji="star-struck" scale="0.5" style={{width: 260, height: 260}} />
      </div>
      <div style={{position: "absolute", bottom: 56, width, textAlign: "center", color: palette.text, fontSize: 32, fontWeight: 600}}>
        Google Fonts' animated emoji, frame-accurate and offline
      </div>
    </AbsoluteFill>
  );
};
