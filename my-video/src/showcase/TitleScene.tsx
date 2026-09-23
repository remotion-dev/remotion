import {Highlight} from "@remotion/rough-notation";
import {useTransitionProgress} from "@remotion/transitions";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {gradientBg, palette} from "./palette";
import {poppins} from "./font";

export type TitleSceneProps = {
  readonly title: string;
  readonly subtitle: string;
};

// Demonstrates: spring() entrances, per-word staggered interpolate(),
// animated rough-notation highlights synced to useCurrentFrame(), and
// @remotion/transitions' useTransitionProgress() -- read inside a child of
// <TransitionSeries.Sequence> to directly manipulate the scene beyond what
// its Transition's presentation itself does, here a slight extra shrink as
// the scene exits into the next one.
export const TitleScene: React.FC<TitleSceneProps> = ({title, subtitle}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {exiting} = useTransitionProgress();

  // A bouncy spring (damping 8) whose overshoot is clamped, starting from
  // 0.8 rather than 0 so the title grows in instead of popping from nothing.
  const titleScale = spring({fps, frame, from: 0.8, to: 1, config: {damping: 8, overshootClamping: true}});
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const words = subtitle.split(" ");
  const highlightIndex = words.findIndex((word) => word.toLowerCase() === "every");
  const lastIndex = words.length - 1;

  return (
    <AbsoluteFill
      style={{
        background: gradientBg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: poppins,
        transform: `scale(${1 - exiting * 0.04})`,
      }}
    >
      <div
        style={{
          fontSize: 110,
          fontWeight: 700,
          color: palette.text,
          letterSpacing: -2,
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
        }}
      >
        {title}
      </div>
      <div style={{fontSize: 36, color: palette.textDim, marginTop: 24, display: "flex"}}>
        {words.map((word, i) => {
          const delay = 20 + i * 4;
          const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const translateY = interpolate(frame, [delay, delay + 12], [16, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          // Every word is wrapped, and `disabled` switches the marker off
          // for all but two, so each word has the same structure. The last
          // word is marked right-to-left (`rtl`). Disabled ones are kept out
          // of the Studio timeline; the two live ones get a readable `name`.
          const highlighted = i === highlightIndex || i === lastIndex;
          const content = (
            <Highlight
              color={i === lastIndex ? "rgba(34, 211, 238, 0.4)" : "rgba(99, 102, 241, 0.55)"}
              disabled={!highlighted}
              rtl={i === lastIndex}
              iterations={1}
              roughness={2}
              padding={{left: 4, right: 4}}
              name={`Highlight "${word}"`}
              showInTimeline={highlighted}
              progress={interpolate(frame, [delay + 10, delay + 30], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}
            >
              {word}
            </Highlight>
          );

          return (
            <span
              key={`${word}-${i}`}
              style={{
                opacity,
                transform: `translateY(${translateY}px)`,
                marginRight: 10,
              }}
            >
              {content}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
