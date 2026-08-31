import { Easing, Interactive, Sequence, interpolate, useCurrentFrame, type InteractiveBaseProps, type InteractiveTransformProps, type InteractivitySchema, type SequenceControls } from "remotion";
import { forwardRef, useImperativeHandle, useRef, type ComponentProps } from "react";

interface PerWordCrossfadeProps {
  fromText: string;
  toText: string;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  speed?: number;
  className?: string;
}

function PerWordCrossfadeBase({
  fromText,
  toText,
  fontSize = 72,
  color = "#171717",
  fontWeight = 600,
  speed = 1,
  className,
}: PerWordCrossfadeProps) {
  const frame = useCurrentFrame() * speed;

  const fromWords = fromText.split(" ");
  const toWords = toText.split(" ");

  const enterDur = 21;
  const enterTravel = 5;
  const exitDur = 15;
  const exitTravelFrom = 6;
  const enterStagger = 2;
  const exitStagger = 1;
  const overlapF = 5;
  const microDelayF = 2;

  const enterEasing = Easing.bezier(0.16, 1, 0.3, 1);
  const exitEasing = Easing.bezier(0.7, 0, 0.84, 0);

  const exitTotal = exitDur + (fromWords.length - 1) * exitStagger;
  const newStart = Math.max(0, exitTotal - overlapF + microDelayF);

  const fontStack =
    "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif";

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        background: "transparent",
      }}
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
        <span
          style={{
            fontSize,
            fontWeight,
            color,
            letterSpacing: "-0.03em",
            fontFamily: fontStack,
          }}
        >
          {fromWords.map((word, i) => {
            const local = frame - i * exitStagger;
            const opacity = interpolate(local, [0, exitDur], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: exitEasing,
            });
            const y = interpolate(local, [exitTravelFrom, exitDur], [0, -6], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: exitEasing,
            });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  marginRight: "0.25em",
                  transformOrigin: "50% 55%",
                  opacity,
                  translate: `0 ${y}px`,
                }}
              >
                {word}
              </span>
            );
          })}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize,
            fontWeight,
            color,
            letterSpacing: "-0.03em",
            fontFamily: fontStack,
          }}
        >
          {toWords.map((word, j) => {
            const local = frame - newStart - j * enterStagger;
            const opacity = interpolate(local, [0, enterDur], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: enterEasing,
            });
            const y = interpolate(local, [0, enterTravel], [8, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: enterEasing,
            });
            return (
              <span
                key={j}
                style={{
                  display: "inline-block",
                  marginRight: "0.25em",
                  transformOrigin: "50% 55%",
                  opacity,
                  translate: `0 ${y}px`,
                }}
              >
                {word}
              </span>
            );
          })}
        </span>
      </div>
    </div>
  );
}

const elementSchema = {
  ...Interactive.baseSchema,
  fromText: {
    type: "text-content",
    default: "Beautifully simple.",
    description: "From text",
  },
  toText: {
    type: "text-content",
    default: "Designed for focus.",
    description: "To text",
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
    default: 720,
    min: 10,
    step: 10,
    description: "Width",
  },
  height: {
    type: "number",
    default: 100,
    min: 10,
    step: 10,
    description: "Height",
  },
  ...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const ELEMENT_PROP_KEYS = new Set(["fromText","toText","fontSize","color","fontWeight","speed"]);

const ELEMENT_PROP_DEFAULTS: Record<string, unknown> = {
  fromText: "Beautifully simple.",
  toText: "Designed for focus.",
  fontSize: 72,
  color: "#171717",
  fontWeight: "600",
  speed: 1,
};

type PerWordCrossfadeElementProps = InteractiveBaseProps &
  InteractiveTransformProps & { readonly width?: number; readonly height?: number } &
  ComponentProps<typeof PerWordCrossfadeBase>;

const PerWordCrossfadeInner = forwardRef<
  HTMLDivElement,
  PerWordCrossfadeElementProps & { readonly controls: SequenceControls | undefined }
>(({ controls, name, style, width = 720, height = 100, ...rest }, ref) => {
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
      name={name ?? "<PerWordCrossfade>"}
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
          <PerWordCrossfadeBase
            {...(componentProps as unknown as ComponentProps<typeof PerWordCrossfadeBase>)}
          />
        </div>
      </div>
    </Sequence>
  );
});

export const PerWordCrossfade = Interactive.withSchema({
  Component: PerWordCrossfadeInner,
  componentName: "<PerWordCrossfade>",
  componentIdentity: null,
  schema: elementSchema,
  supportsEffects: false,
});
