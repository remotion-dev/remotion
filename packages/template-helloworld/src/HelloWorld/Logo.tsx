import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import type React from "react";
import { Arc } from "./Arc";
import { Atom } from "./Atom";

export type LogoProps = {
  readonly logoColor1: string;
  readonly logoColor2: string;
  readonly style?: React.CSSProperties;
};

const LogoInner: React.FC<LogoProps> = ({ logoColor1, logoColor2, style }) => {
  const { durationInFrames, fps } = useVideoConfig();
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 500,
        height: 500,
        marginLeft: -250,
        marginTop: -250,
        scale: interpolate(frame, [0, fps], [0, 1], {
          easing: Easing.spring({ mass: 0.5 }),
          output: "perceptual-scale",
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        rotate: interpolate(frame, [0, durationInFrames], ["0deg", "360deg"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        ...style,
      }}
    >
      <Arc
        rotation={30}
        color1={logoColor1}
        color2={logoColor2}
      />
      <Arc
        rotation={90}
        color1={logoColor1}
        color2={logoColor2}
      />
      <Arc
        rotation={-30}
        color1={logoColor1}
        color2={logoColor2}
      />
      <Atom color1={logoColor1} color2={logoColor2} />
    </Interactive.Div>
  );
};

const logoSchema = {
  logoColor1: { type: "color", default: "#91EAE4", description: "First logo color" },
  logoColor2: { type: "color", default: "#86A8E7", description: "Second logo color" },
} as const satisfies InteractivitySchema;

export const Logo = Interactive.withSchema({
  Component: LogoInner,
  componentName: "<Logo>",
  schema: logoSchema,
  wrapInSequence: true,
});
