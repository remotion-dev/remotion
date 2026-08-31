import { Easing, Interactive, Sequence, interpolate, useCurrentFrame, type InteractiveBaseProps, type InteractiveTransformProps, type InteractivitySchema, type SequenceControls } from "remotion";
import { forwardRef, useImperativeHandle, useRef, type ComponentProps } from "react";

interface BottomUpLettersProps {
  text: string;
  staggerDelay?: number;
  distance?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  speed?: number;
  className?: string;
}

function BottomUpLettersBase({
  text,
  staggerDelay = 3,
  distance = 46,
  fontSize = 72,
  color = "#171717",
  fontWeight = 600,
  speed = 1,
  className,
}: BottomUpLettersProps) {
  const frame = useCurrentFrame() * speed;

  const chars = Array.from(text);
  const charDurationFrames = 12;
  const charTravelFrames = 7;

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
          letterSpacing: "-0.05em",
          fontFamily:
            "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {chars.map((char, i) => {
          const local = frame - i * staggerDelay;
          const easing = Easing.bezier(0.18, 1, 0.32, 1);
          const opacity = interpolate(local, [0, charDurationFrames], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing,
          });
          const y = interpolate(local, [0, charTravelFrames], [distance, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing,
          });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                whiteSpace: "pre",
                backfaceVisibility: "hidden",
                transformOrigin: "50% 55%",
                opacity,
                translate: `0 ${y}px`,
              }}
            >
              {char}
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
    default: "Shift",
    description: "Text",
  },
  staggerDelay: {
    type: "number",
    min: 1,
    max: 12,
    step: 1,
    default: 3,
    description: "Stagger",
    hiddenFromList: false,
  },
  distance: {
    type: "number",
    min: 0,
    max: 120,
    step: 1,
    default: 46,
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
    default: 190,
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

const ELEMENT_PROP_KEYS = new Set(["text","staggerDelay","distance","fontSize","color","fontWeight","speed"]);

const ELEMENT_PROP_DEFAULTS: Record<string, unknown> = {
  text: "Shift",
  staggerDelay: 3,
  distance: 46,
  fontSize: 72,
  color: "#171717",
  fontWeight: "600",
  speed: 1,
};

type BottomUpLettersElementProps = InteractiveBaseProps &
  InteractiveTransformProps & { readonly width?: number; readonly height?: number } &
  ComponentProps<typeof BottomUpLettersBase>;

const BottomUpLettersInner = forwardRef<
  HTMLDivElement,
  BottomUpLettersElementProps & { readonly controls: SequenceControls | undefined }
>(({ controls, name, style, width = 190, height = 100, ...rest }, ref) => {
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
      name={name ?? "<BottomUpLetters>"}
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
          <BottomUpLettersBase
            {...(componentProps as unknown as ComponentProps<typeof BottomUpLettersBase>)}
          />
        </div>
      </div>
    </Sequence>
  );
});

export const BottomUpLetters = Interactive.withSchema({
  Component: BottomUpLettersInner,
  componentName: "<BottomUpLetters>",
  componentIdentity: null,
  schema: elementSchema,
  supportsEffects: false,
});
