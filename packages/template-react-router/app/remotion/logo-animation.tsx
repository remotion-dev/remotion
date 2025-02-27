import { useEffect } from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  Series,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { LogoAnimationSequence } from "./components/logo-animation-sequence";
import { PersonalizedName } from "./components/personalized-name";
import { PlusSymbol } from "./components/plus-symbol";
import { RemixLineToPerson } from "./components/remix-logo/remix-line-to-person";
import { RemixNotAnimated } from "./components/remix-logo/remix-not-animated";
import { RemixPersonToFusion } from "./components/remix-logo/remix-person-to-fusion";
import { RemotionLineToPerson } from "./components/remotion-logo/remotion-line-to-person";
import { RemotionNotAnimated } from "./components/remotion-logo/remotion-not-animated";
import { RemotionPersonToFusion } from "./components/remotion-logo/remotion-person-to-fusion";
import type { LogoAnimationProps } from "./constants";
import { loadFonts } from "./load-fonts";

export const LogoAnimation: React.FC<LogoAnimationProps> = (
  logoAnimationProps,
) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const { personalizedName } = logoAnimationProps;
  useEffect(() => {
    loadFonts();
  }, []);

  const progress = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
  });

  const remixXOffset = interpolate(progress, [0, 1], [-900, 180]);
  const remotionXOffset = interpolate(progress, [0, 1], [900, 0]);
  const plusYOffset = interpolate(progress, [0, 1], [900, 0]);

  const opacity = spring({
    fps,
    frame: frame - fps * 1.5,
    config: {
      damping: 200,
    },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "white",
      }}
    >
      <Series>
        <Series.Sequence durationInFrames={fps * 1.5}>
          <PersonalizedName personalizedName={personalizedName} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={fps * 1.5}>
          <AbsoluteFill
            style={{
              opacity,
            }}
          >
            <RemixNotAnimated horizontalOffset={remixXOffset} />
            <RemotionNotAnimated horizontalOffset={remotionXOffset} />
            <PlusSymbol verticalOffset={plusYOffset} />
          </AbsoluteFill>
        </Series.Sequence>
        <Series.Sequence durationInFrames={fps * 1.5}>
          <RemixLineToPerson horizontalOffset={remixXOffset} />
          <RemotionLineToPerson horizontalOffset={remotionXOffset} />
          <PlusSymbol />
        </Series.Sequence>
        <Series.Sequence durationInFrames={fps * 1.5}>
          <RemixPersonToFusion horizontalOffset={remixXOffset} />
          <RemotionPersonToFusion horizontalOffset={remotionXOffset} />
          <PlusSymbol />
        </Series.Sequence>
      </Series>
      <Sequence from={fps * 5.5} durationInFrames={fps * 4}>
        <LogoAnimationSequence />
      </Sequence>
    </AbsoluteFill>
  );
};
