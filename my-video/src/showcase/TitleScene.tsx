import {Highlight} from "@remotion/rough-notation";
import {useTransitionProgress} from "@remotion/transitions";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {gradientBg, palette} from "./palette";
import {poppins} from "./font";

export type TitleSceneProps = {
  readonly title: string;
  readonly subtitle: string;
};

// Demonstrates: spring() entrances, per-word staggered interpolate(), an
// animated rough-notation highlight synced to useCurrentFrame(), and
// @remotion/transitions' useTransitionProgress() -- read inside a child of
// <TransitionSeries.Sequence> to directly manipulate the scene beyond what
// its Transition's presentation itself does, here a slight extra shrink as
// the scene exits into the next one.
export const TitleScene: React.FC<TitleSceneProps> = ({title, subtitle}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {exiting} = useTransitionProgress();

  const titleScale = spring({fps, frame, config: {damping: 200}});
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const words = subtitle.split(" ");
  const highlightIndex = words.findIndex((word) => word.toLowerCase() === "every");

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

          const content =
            i === highlightIndex ? (
              <Highlight
                color="rgba(99, 102, 241, 0.55)"
                progress={interpolate(frame, [delay + 10, delay + 30], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })}
              >
                {word}
              </Highlight>
            ) : (
              word
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
