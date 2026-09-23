import {
  AbsoluteFill,
  Easing,
  assertValidInterpolateEasingOption,
  assertValidInterpolatePosterizeOption,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

const START = 15;
const END = 55;
const TRACK = 300;
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

const KEYFRAMES = [START, 35, END];
const SEGMENT_EASING = [Easing.in(Easing.cubic), Easing.out(Easing.bounce)];
// The same validators interpolate() runs on its own options, exported for
// code that builds those options up front -- this one passes, so the
// easing-array card below is safe to render.
assertValidInterpolateEasingOption(SEGMENT_EASING, KEYFRAMES.length);
const posterizeError = (() => {
  try {
    assertValidInterpolatePosterizeOption(0);
    return "no error";
  } catch (err) {
    return (err as Error).message;
  }
})();

const Card: React.FC<{title: string; readout: string; children: React.ReactNode}> = ({title, readout, children}) => (
  <div style={{background: palette.bgAlt, borderRadius: 12, padding: "12px 16px", width: 380, height: 138, display: "flex", flexDirection: "column"}}>
    <div style={{color: palette.accent2, fontSize: 14, fontFamily: "monospace"}}>{title}</div>
    <div style={{flex: 1, position: "relative"}}>{children}</div>
    <div style={{color: palette.textDim, fontSize: 13, fontFamily: "monospace"}}>{readout}</div>
  </div>
);

const Dot: React.FC<{x: number; y: number}> = ({x, y}) => (
  <div style={{position: "absolute", left: x, top: y, width: 14, height: 14, borderRadius: 7, background: palette.accent}} />
);

const Track: React.FC = () => <div style={{position: "absolute", left: 7, top: 36, width: TRACK, height: 2, background: palette.textDim, opacity: 0.4}} />;

// Every option interpolate() accepts, one live card each: per-segment
// easing arrays, posterize (stepped "on fives" motion), all four
// extrapolate types on the same input, output: "perceptual-scale" (the
// visible area -- scale squared -- changes linearly, so it runs ahead of a
// plain linear scale mid-way), CSS-string outputs for the
// rotate/translate/transform-origin properties (outputType asserts which one
// a string must be), outputType: "font-weight" (accepts "normal"/"bold"),
// and numeric-tuple outputs. The two exported option validators run above.
export const InterpolateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();

  const eased = interpolate(frame, KEYFRAMES, [0, 0.6, 1], {easing: SEGMENT_EASING, ...clamp});
  const stepped = interpolate(frame, [START, END], [0, 1], {posterize: 5, ...clamp});

  const extrapolated = (["clamp", "extend", "identity", "wrap"] as const).map((type) => ({
    type,
    value: interpolate(frame, [START, 30], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: type}),
  }));
  const wrapped = extrapolated[3].value;

  const linearScale = interpolate(frame, [START, END], [1, 6], clamp);
  const perceptualScale = interpolate(frame, [START, END], [1, 6], {output: "perceptual-scale", ...clamp});

  const rotate = interpolate(frame, [START, END], ["0deg", "270deg"], {outputType: "rotate", ...clamp});
  const translate = interpolate(frame, [START, END], ["0px 0px", "280px -14px"], {outputType: "translate", ...clamp});
  const origin = interpolate(frame, [START, END], ["left top", "right bottom"], {outputType: "transform-origin", ...clamp});
  const fontWeight = interpolate(frame, [START, END], ["normal", 900], {outputType: "font-weight", ...clamp});
  const [tupleX, tupleY] = interpolate(frame, [START, END], [[0, -24], [TRACK, 24]], clamp);

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins, alignItems: "center"}}>
      <div style={{position: "absolute", top: 40, width, textAlign: "center", color: palette.textDim, fontSize: 26}}>
        core remotion · interpolate() — every option
      </div>
      <div style={{position: "absolute", top: 92, display: "grid", gridTemplateColumns: "repeat(3, 380px)", gap: 14}}>
        <Card title="easing: [in(cubic), out(bounce)]" readout={`3 keyframes, 2 segment easings → ${eased.toFixed(2)}`}>
          <Track />
          <Dot x={eased * TRACK} y={30} />
        </Card>
        <Card title="posterize: 5" readout={`input snapped to every 5th frame → ${stepped.toFixed(2)}`}>
          <Track />
          <Dot x={stepped * TRACK} y={30} />
        </Card>
        <Card title="extrapolateRight past [15, 30]" readout={extrapolated.map((e) => `${e.type} ${e.value.toFixed(1)}`).join(" · ")}>
          <div style={{position: "absolute", left: 7, top: 30, width: TRACK, height: 14, borderRadius: 7, background: palette.bg}} />
          <div style={{position: "absolute", left: 7, top: 30, width: wrapped * TRACK, height: 14, borderRadius: 7, background: palette.accent}} />
        </Card>
        <Card title={'output: "perceptual-scale"'} readout={`linear ${linearScale.toFixed(2)}× · area-linear ${perceptualScale.toFixed(2)}×`}>
          <div style={{position: "absolute", left: 90, top: 30, width: 10, height: 10, background: palette.textDim, transform: `scale(${linearScale})`}} />
          <div style={{position: "absolute", left: 250, top: 30, width: 10, height: 10, background: palette.accent, transform: `scale(${perceptualScale})`}} />
        </Card>
        <Card title={'"0deg" → "270deg" (outputType "rotate")'} readout={`rotate: ${rotate}`}>
          <div style={{position: "absolute", left: 160, top: 14, width: 44, height: 44, borderRadius: 6, background: palette.accent, rotate}} />
        </Card>
        <Card title={'"0px 0px" → "280px -14px" (translate)'} readout={`translate: ${translate}`}>
          <div style={{position: "absolute", left: 7, top: 30, width: 14, height: 14, borderRadius: 7, background: palette.accent, translate}} />
        </Card>
        <Card title={'outputType: "transform-origin"'} readout={`transform-origin: ${origin}`}>
          <div style={{position: "absolute", left: 160, top: 14, width: 44, height: 44, border: `2px solid ${palette.accent}`, borderRadius: 6, transformOrigin: origin, rotate}} />
        </Card>
        <Card title={'outputType: "font-weight"'} readout={`"normal" → 900 · font-weight: ${fontWeight}`}>
          <div style={{position: "absolute", left: 0, top: 4, width: 348, textAlign: "center", color: palette.text, fontSize: 40, fontWeight}}>Remotion</div>
        </Card>
        <Card title="tuple output [[0, -24], [300, 24]]" readout={`[x, y] = [${tupleX.toFixed(0)}, ${tupleY.toFixed(0)}]`}>
          <Dot x={tupleX} y={30 + tupleY * 0.6} />
        </Card>
      </div>
      <div style={{position: "absolute", bottom: 48, width, textAlign: "center", color: palette.textDim, fontSize: 15, fontFamily: "monospace", lineHeight: 1.6}}>
        <div>assertValidInterpolateEasingOption(SEGMENT_EASING, 3): passed</div>
        <div>assertValidInterpolatePosterizeOption(0): “{posterizeError}”</div>
      </div>
    </AbsoluteFill>
  );
};
