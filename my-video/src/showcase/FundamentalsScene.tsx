import {
  AbsoluteFill,
  Easing,
  Freeze,
  Loop,
  Series,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

const Label: React.FC<{children: string}> = ({children}) => {
  const {width} = useVideoConfig();
  return (
    <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 26}}>
      {children}
    </div>
  );
};

// Every static method on Easing, resolved to a plain (t: number) => number
// curve. poly/elastic/back/spring/bezier take their own params first;
// in/out/inOut are modifiers, applied here to quad to show how they reshape
// an existing curve rather than being curves of their own.
const EASING_CURVES = [
  {name: "step0", fn: Easing.step0},
  {name: "step1", fn: Easing.step1},
  {name: "linear", fn: Easing.linear},
  {name: "ease", fn: Easing.ease},
  {name: "quad", fn: Easing.quad},
  {name: "cubic", fn: Easing.cubic},
  {name: "poly(4)", fn: Easing.poly(4)},
  {name: "sin", fn: Easing.sin},
  {name: "circle", fn: Easing.circle},
  {name: "exp", fn: Easing.exp},
  {name: "elastic", fn: Easing.elastic(1)},
  {name: "back", fn: Easing.back()},
  {name: "spring", fn: Easing.spring()},
  {name: "bounce", fn: Easing.bounce},
  {name: "bezier", fn: Easing.bezier(0.65, 0, 0.35, 1)},
  {name: "in(quad)", fn: Easing.in(Easing.quad)},
  {name: "out(quad)", fn: Easing.out(Easing.quad)},
  {name: "inOut(quad)", fn: Easing.inOut(Easing.quad)},
] as const;

const CURVE_SAMPLES = 24;
const TILE_WIDTH = 190;
const TILE_HEIGHT = 90;

// Beat 1: every Easing curve plotted as its own small sparkline (t on x,
// easing(t) on y, clamped to a visible range since elastic/back/spring
// overshoot [0, 1]), with a dot riding each curve in sync with the same
// shared progress -- eighteen curves side by side make the differences
// between them obvious in a way a single animated dot per curve wouldn't.
const EasingBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 24], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
      <Label>Easing — every curve</Label>
      <div style={{display: "grid", gridTemplateColumns: `repeat(6, ${TILE_WIDTH}px)`, gap: 8}}>
        {EASING_CURVES.map(({name, fn}) => {
          const toY = (value: number) => TILE_HEIGHT - 14 - Math.min(1, Math.max(0, value)) * (TILE_HEIGHT - 28);
          const points = Array.from({length: CURVE_SAMPLES + 1}, (_, i) => {
            const x = (i / CURVE_SAMPLES) * (TILE_WIDTH - 16) + 8;
            return `${x},${toY(fn(i / CURVE_SAMPLES))}`;
          }).join(" ");
          const dotX = t * (TILE_WIDTH - 16) + 8;
          const dotY = toY(fn(t));

          return (
            <div key={name} style={{background: palette.bgAlt, borderRadius: 8, padding: "4px 0"}}>
              <svg width={TILE_WIDTH} height={TILE_HEIGHT}>
                <polyline points={points} fill="none" stroke={palette.accent2} strokeWidth={2} />
                <circle cx={dotX} cy={dotY} r={4} fill={palette.accent} />
                <text x={8} y={16} fill={palette.textDim} fontSize={13} fontFamily="monospace">
                  {name}
                </text>
              </svg>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Beat 2: <Loop> repeats a short pulse a fixed number of times, then
// <Freeze> holds the final frame instead of letting it play past its range.
const LoopFreezeBeat: React.FC = () => {
  const {width} = useVideoConfig();
  const Pulse: React.FC = () => {
    const frame = useCurrentFrame();
    const scale = 1 + 0.3 * Math.sin((frame / 15) * Math.PI);
    return (
      <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
        <div style={{width: 90, height: 90, borderRadius: "50%", background: palette.accent, transform: `scale(${scale})`}} />
      </AbsoluteFill>
    );
  };

  return (
    <AbsoluteFill>
      <Label>{"<Loop> repeats · <Freeze> holds"}</Label>
      <Series>
        <Series.Sequence durationInFrames={18}>
          <Loop durationInFrames={6} times={3}>
            <Pulse />
          </Loop>
        </Series.Sequence>
        <Series.Sequence durationInFrames={7}>
          <Freeze frame={5}>
            <Pulse />
          </Freeze>
        </Series.Sequence>
      </Series>
      <div style={{position: "absolute", bottom: 56, width, textAlign: "center", color: palette.text, fontSize: 24}}>
        Same component, sequenced with &lt;Series&gt;
      </div>
    </AbsoluteFill>
  );
};

// Beat 3: random() is seeded and deterministic — the exact same scatter
// renders on every machine, every time, unlike Math.random().
const RandomBeat: React.FC = () => {
  const {width, height} = useVideoConfig();
  const dots = Array.from({length: 40}, (_, i) => ({
    x: random(`dot-x-${i}`) * width,
    y: random(`dot-y-${i}`) * (height - 200) + 120,
    r: random(`dot-r-${i}`) * 8 + 4,
  }));

  return (
    <AbsoluteFill>
      <Label>{"random() — seeded, deterministic"}</Label>
      <svg width={width} height={height}>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={palette.accent2} opacity={0.8} />
        ))}
      </svg>
      <div style={{position: "absolute", bottom: 56, width, textAlign: "center", color: palette.text, fontSize: 24}}>
        Same scatter on every render, every machine
      </div>
    </AbsoluteFill>
  );
};

// Demonstrates: every static method on Easing (step0/step1/linear/ease/
// quad/cubic/poly/sin/circle/exp/elastic/back/spring/bounce/bezier and the
// in/out/inOut modifiers), <Series>, <Loop>, <Freeze>, and random() from
// core `remotion` — none of them need an extra package.
export const FundamentalsScene: React.FC = () => {
  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins}}>
      <Series>
        <Series.Sequence durationInFrames={25}>
          <EasingBeat />
        </Series.Sequence>
        <Series.Sequence durationInFrames={25}>
          <LoopFreezeBeat />
        </Series.Sequence>
        <Series.Sequence durationInFrames={25}>
          <RandomBeat />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
