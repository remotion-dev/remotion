import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";

export type HelloWorldProps = {
  readonly titleText: string;
  readonly titleColor: string;
};

export const HelloWorld: React.FC<HelloWorldProps> = ({
  titleText,
  titleColor,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      <Interactive.Div
        name="Content fade"
        premountFor={fps}
        style={{
          position: "absolute",
          inset: 0,
          opacity: interpolate(
            frame,
            [durationInFrames - 25, durationInFrames - 15],
            [1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      >
        <Logo
          name="Remotion logo"
          premountFor={fps}
          logoColor1="#91EAE4"
          logoColor2="#86A8E7"
          style={{
            translate: interpolate(frame, [25, 55], ["0px 0px", "0px -150px"], {
              easing: Easing.spring({ damping: 100 }),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
        <Title
          name="Welcome title"
          from={35}
          premountFor={fps}
          titleText={titleText}
          titleColor={titleColor}
        />
        <Interactive.Div
          name="Editing hint"
          from={75}
          premountFor={fps}
          style={{
            fontFamily: "SF Pro Text, Helvetica, Arial, sans-serif",
            fontSize: 40,
            textAlign: "center",
            position: "absolute",
            bottom: 140,
            width: "100%",
            opacity: interpolate(frame, [75, 105], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Edit <code style={{ color: "#86A8E7" }}>src/Root.tsx</code> and save to reload.
        </Interactive.Div>
      </Interactive.Div>
    </AbsoluteFill>
  );
};
