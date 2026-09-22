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

// Beat 1: three dots racing the same distance under three different
// Easing curves, to make the curve differences visible rather than abstract.
const EasingBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const curves = [
    {name: "linear", ease: Easing.linear, color: palette.accent},
    {name: "ease", ease: Easing.ease, color: palette.accent2},
    {name: "bounce", ease: Easing.bounce, color: "#f472b6"},
  ];

  return (
    <AbsoluteFill style={{justifyContent: "center"}}>
      <Label>Easing curves</Label>
      <div style={{display: "flex", flexDirection: "column", gap: 40, alignItems: "flex-start", marginLeft: 340}}>
        {curves.map((c) => {
          const x = interpolate(frame, [0, 24], [0, 600], {
            easing: c.ease,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div key={c.name} style={{display: "flex", alignItems: "center", gap: 16}}>
              <div style={{width: 24, height: 24, borderRadius: "50%", background: c.color, transform: `translateX(${x}px)`}} />
              <span style={{color: palette.textDim, fontSize: 20, position: "absolute", left: 0}}>{c.name}</span>
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

// Demonstrates: Easing, <Series>, <Loop>, <Freeze>, and random() from core
// `remotion` — none of them need an extra package.
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
