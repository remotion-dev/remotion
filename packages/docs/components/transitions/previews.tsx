import type { PlayerRef } from "@remotion/player";
import { Player } from "@remotion/player";
import type { TransitionPresentation } from "@remotion/transitions";
import { springTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import type { SlideDirection } from "@remotion/transitions/slide";
import { slide } from "@remotion/transitions/slide";
import type { WipeDirection } from "@remotion/transitions/wipe";
import { wipe } from "@remotion/transitions/wipe";
import React, { useEffect, useRef } from "react";
import { AbsoluteFill } from "remotion";

export const PresentationPreview: React.FC<{
  effect: TransitionPresentation<Record<string, unknown>>;
}> = ({ effect }) => {
  const ref = useRef<PlayerRef>(null);

  useEffect(() => {
    const { current } = ref;
    if (!current) {
      return;
    }

    const callback = () => {
      current?.seekTo(0);
      current?.play();
    };

    current?.getContainerNode()?.addEventListener("pointerenter", callback);

    return () => {
      current
        ?.getContainerNode()
        ?.removeEventListener("pointerenter", callback);
    };
  }, []);

  return (
    <Player
      ref={ref}
      component={SampleTransition}
      compositionHeight={280}
      compositionWidth={540}
      durationInFrames={60}
      fps={30}
      numberOfSharedAudioTags={0}
      style={{
        height: 60,
        borderRadius: 6,
      }}
      inputProps={{
        effect,
      }}
    />
  );
};

const SceneA: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0b84f3",
        fontFamily: "sans-serif",
        fontWeight: 900,
        color: "white",
        fontSize: 100,
      }}
    >
      A
    </AbsoluteFill>
  );
};

const SceneB: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "pink",
        fontFamily: "sans-serif",
        fontWeight: 900,
        color: "white",
        fontSize: 100,
      }}
    >
      B
    </AbsoluteFill>
  );
};

export const SampleTransition: React.FC<{
  effect: TransitionPresentation<Record<string, unknown>>;
}> = ({ effect }) => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={45}>
        <SceneA />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={effect}
        timing={springTiming({
          config: {
            damping: 200,
          },
          durationInFrames: 45,
          durationRestThreshold: 0.001,
        })}
      />
      <TransitionSeries.Sequence durationInFrames={60}>
        <SceneB />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

export const FadeDemo: React.FC = () => {
  return <SampleTransition effect={fade()} />;
};

export const SlideDemo: React.FC<{
  direction: SlideDirection;
}> = ({ direction }) => {
  return <SampleTransition effect={slide({ direction })} />;
};

export const WipeDemo: React.FC<{
  direction: WipeDirection;
}> = ({ direction }) => {
  return <SampleTransition effect={wipe({ direction })} />;
};
