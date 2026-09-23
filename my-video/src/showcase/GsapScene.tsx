import {useGsapTimeline} from "@remotion/gsap";
import {AbsoluteFill, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

// Demonstrates: @remotion/gsap's useGsapTimeline() — builds one GSAP
// timeline scoped to a ref, paused at frame 0, and seeks it deterministically
// from Remotion's own frame instead of letting GSAP's ticker drive it (a
// ticker-driven timeline would not render the same frame twice, breaking
// still exports and parallel/out-of-order rendering).
//
// Its one option, {dependencies}, rebuilds the timeline when those values
// change (e.g. props edited in the Studio). This timeline reads no props or
// state, so it passes none: a rebuild would be invisible in a render anyway.
export const GsapScene: React.FC = () => {
  const {width} = useVideoConfig();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
    timeline
      .from(selector(".gsap-box"), {scale: 0, rotate: -90, duration: 1, ease: "back.out(2)"})
      .to(selector(".gsap-box"), {x: 220, duration: 0.8, ease: "power2.inOut"}, "+=0.2")
      .to(selector(".gsap-box"), {x: -220, duration: 0.8, ease: "power2.inOut"})
      .to(selector(".gsap-box"), {x: 0, rotate: 360, duration: 0.8, ease: "power2.inOut"});
  });

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins, justifyContent: "center", alignItems: "center"}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 26}}>
        @remotion/gsap · a GSAP timeline seeked by useCurrentFrame()
      </div>
      <div ref={scope} style={{width: 1, height: 1}}>
        <div
          className="gsap-box"
          style={{
            width: 130,
            height: 130,
            borderRadius: 24,
            background: `linear-gradient(135deg, ${palette.accent}, ${palette.accent2})`,
          }}
        />
      </div>
      <div style={{position: "absolute", bottom: 56, width, textAlign: "center", color: palette.text, fontSize: 32, fontWeight: 600}}>
        GSAP&apos;s easing and timeline API, frame-locked
      </div>
    </AbsoluteFill>
  );
};
