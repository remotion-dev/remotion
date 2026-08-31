import { Easing, Interactive, Sequence, interpolate, useCurrentFrame, useVideoConfig, type InteractiveBaseProps, type InteractiveTransformProps, type InteractivitySchema, type SequenceControls } from "remotion";
import { forwardRef, useImperativeHandle, useRef, type ComponentProps } from "react";

interface LineByLineSlideProps {
  text: string;
  distance?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  speed?: number;
  className?: string;
}

function LineByLineSlideBase({
  text,
  distance = 48,
  fontSize = 72,
  color = "#171717",
  fontWeight = 600,
  speed = 1,
  className,
}: LineByLineSlideProps) {
  const frame = useCurrentFrame() * speed;
  const { durationInFrames } = useVideoConfig();

  const lines = text.split("\n");

  const enterDur = 27;
  const enterTravel = 14;
  const exitDur = 18;
  const exitTravelFrom = 8;
  const enterStagger = 4;
  const exitStagger = 2;

  const enterEasing = Easing.bezier(0.22, 1, 0.36, 1);
  const exitEasing = Easing.bezier(0.64, 0, 0.78, 0);

  const enterEnd = enterDur + (lines.length - 1) * enterStagger;
  const exitStart = Math.max(
    enterEnd,
    durationInFrames - exitDur - (lines.length - 1) * exitStagger,
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <span
        className={className}
        style={{
          fontSize,
          fontWeight,
          color,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          textAlign: "left",
          fontFamily:
            "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {lines.map((line, i) => {
          const enterLocal = frame - i * enterStagger;
          const exitLocal = frame - exitStart - i * exitStagger;

          const enterP = interpolate(enterLocal, [0, enterDur], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: enterEasing,
          });

          const exitP = interpolate(exitLocal, [0, exitDur], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: exitEasing,
          });

          const opacity = enterP * (1 - exitP);

          const xEnter = interpolate(
            enterLocal,
            [0, enterTravel],
            [-distance, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: enterEasing,
            },
          );

          const xExit = interpolate(
            exitLocal,
            [exitTravelFrom, exitDur],
            [0, distance],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: exitEasing,
            },
          );

          const x = xEnter + xExit;

          return (
            <span
              key={i}
              style={{
                display: "block",
                transformOrigin: "0% 50%",
                opacity,
                translate: `${x}px`,
              }}
            >
              {line}
            </span>
          );
        })}
      </span>
    </div>
  );
}

const elementSchema = {
  ...Interactive.baseSchema,
  text: {
    type: "text-content",
    default: "Think different.\nDo more.",
    description: "Text",
  },
  distance: {
    type: "number",
    min: 0,
    max: 160,
    step: 1,
    default: 48,
    description: "Distance",
    hiddenFromList: false,
  },
  fontSize: {
    type: "number",
    min: 12,
    max: 160,
    step: 1,
    default: 72,
    description: "Font size",
    hiddenFromList: false,
  },
  color: {
    type: "color",
    default: "#171717",
    description: "Color",
  },
  fontWeight: {
    type: "enum",
    default: "600",
    variants: {
      "400": {},
      "500": {},
      "600": {},
      "700": {},
    },
    description: "Font weight",
  },
  speed: {
    type: "number",
    default: 1,
    min: 0.25,
    max: 4,
    step: 0.25,
    description: "Speed",
    hiddenFromList: false,
  },
  width: {
    type: "number",
    default: 600,
    min: 10,
    step: 10,
    description: "Width",
  },
  height: {
    type: "number",
    default: 200,
    min: 10,
    step: 10,
    description: "Height",
  },
  ...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const ELEMENT_PROP_KEYS = new Set(["text","distance","fontSize","color","fontWeight","speed"]);

const ELEMENT_PROP_DEFAULTS: Record<string, unknown> = {
  text: "Think different.\nDo more.",
  distance: 48,
  fontSize: 72,
  color: "#171717",
  fontWeight: "600",
  speed: 1,
};

type LineByLineSlideElementProps = InteractiveBaseProps &
  InteractiveTransformProps & { readonly width?: number; readonly height?: number } &
  ComponentProps<typeof LineByLineSlideBase>;

const LineByLineSlideInner = forwardRef<
  HTMLDivElement,
  LineByLineSlideElementProps & { readonly controls: SequenceControls | undefined }
>(({ controls, name, style, width = 600, height = 200, ...rest }, ref) => {
  const outlineRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);
  const componentProps: Record<string, unknown> = { ...ELEMENT_PROP_DEFAULTS };
  const sequenceProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (ELEMENT_PROP_KEYS.has(key)) {
      if (value !== undefined) componentProps[key] = value;
    } else {
      sequenceProps[key] = value;
    }
  }
  return (
    <Sequence
      layout="none"
      {...sequenceProps}
      controls={controls}
      name={name ?? "<LineByLineSlide>"}
      outlineRef={outlineRef}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          ref={outlineRef}
          style={{
            position: "relative",
            width,
            height,
            ...style,
          }}
        >
          <LineByLineSlideBase
            {...(componentProps as unknown as ComponentProps<typeof LineByLineSlideBase>)}
          />
        </div>
      </div>
    </Sequence>
  );
});

export const LineByLineSlide = Interactive.withSchema({
  Component: LineByLineSlideInner,
  componentName: "<LineByLineSlide>",
  componentIdentity: null,
  schema: elementSchema,
  supportsEffects: false,
});
