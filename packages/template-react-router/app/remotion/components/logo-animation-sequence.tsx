import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PlusSymbol } from "./plus-symbol";
import { GlowingR } from "./remix-logo/glowing-r";
import { RemixPersonToFusion } from "./remix-logo/remix-person-to-fusion";
import { RemotionLogo } from "./remotion-logo/remotion-logo";
import { RemotionPersonToFusion } from "./remotion-logo/remotion-person-to-fusion";

export const LogoAnimationSequence = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const logoScale = spring({
    fps,
    frame,
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
      <AbsoluteFill
        style={{
          transform: `scale(${1 - logoScale})`,
        }}
      >
        <RemixPersonToFusion horizontalOffset={180} progressOverride={1} />
        <PlusSymbol />
        <RemotionPersonToFusion horizontalOffset={0} progressOverride={1} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `scale(${logoScale})`,
        }}
      >
        <RemotionLogo size={1200} />
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginLeft: -40,
            transform: "scale(0.8)",
          }}
        >
          <GlowingR />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
