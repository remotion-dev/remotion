import {Player, Thumbnail} from "@remotion/player";
import type {CallbackListener, PlayerRef} from "@remotion/player";
import {useEffect, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {ShowcaseReel, showcaseReelDefaultProps} from "../src/showcase/ShowcaseReel";

// The same settings as the "ShowcaseReel" <Composition> in src/Root.tsx.
// <Player> and <Thumbnail> take a component directly, not a <Composition>,
// and never run its calculateMetadata(), so the 315 frames that
// calculateShowcaseReelMetadata() computes (5 scenes × 75 − 4 transitions × 15)
// are passed explicitly. Update this if the reel's timing changes.
const reel = {
  component: ShowcaseReel,
  inputProps: showcaseReelDefaultProps,
  durationInFrames: 315,
  compositionWidth: 1280,
  compositionHeight: 720,
  fps: 30,
} as const;

// Frame 0 is the title's fade-in (almost empty), so the Player opens on a
// frame where the title is fully visible instead.
const INITIAL_FRAME = 45;

// One frame from the middle of four of the reel's scenes. Each scene is 75
// frames and the next one starts 15 frames before it ends (the transition),
// so scene n spans frames 60n to 60n + 74.
const chapters = [
  {label: "Title", frame: 45},
  {label: "Shapes", frame: 100},
  {label: "Captions", frame: 160},
  {label: "Route", frame: 220},
] as const;

// Kept as a sibling of the <Player> so that frame updates re-render only this
// readout, not the Player (see remotion.dev/docs/player/best-practices).
const PlayerReadout: React.FC<{playerRef: React.RefObject<PlayerRef | null>}> = ({playerRef}) => {
  const [frame, setFrame] = useState(0);
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    const log = (entry: string) => setEvents((prev) => [entry, ...prev].slice(0, 5));
    const onFrame: CallbackListener<"frameupdate"> = ({detail}) => setFrame(detail.frame);
    const onSeeked: CallbackListener<"seeked"> = ({detail}) => log(`seeked → frame ${detail.frame}`);
    const onPlay: CallbackListener<"play"> = () => log(`play from frame ${player.getCurrentFrame()}`);
    const onPause: CallbackListener<"pause"> = () => log(`pause at frame ${player.getCurrentFrame()}`);
    const onRateChange: CallbackListener<"ratechange"> = ({detail}) =>
      log(`ratechange → ${detail.playbackRate}×`);

    setFrame(player.getCurrentFrame());
    player.addEventListener("frameupdate", onFrame);
    player.addEventListener("seeked", onSeeked);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("ratechange", onRateChange);
    return () => {
      player.removeEventListener("frameupdate", onFrame);
      player.removeEventListener("seeked", onSeeked);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("ratechange", onRateChange);
    };
  }, [playerRef]);

  return (
    <div className="readout" aria-live="polite">
      <div>
        <span className="dim">frameupdate</span> frame <strong data-testid="frame">{frame}</strong> /{" "}
        {reel.durationInFrames - 1}
      </div>
      <div data-testid="events">
        <span className="dim">last events</span> {events.length === 0 ? "none yet" : events.join(" · ")}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);

  return (
    <main>
      <h1>ShowcaseReel in a web page</h1>
      <p className="dim">
        <code>@remotion/player</code>'s <code>&lt;Player&gt;</code> and <code>&lt;Thumbnail&gt;</code>, rendering
        the reel's React component from <code>src/showcase/</code> directly in the browser, with no render step.
      </p>

      <Player
        ref={playerRef}
        {...reel}
        controls
        loop
        initialFrame={INITIAL_FRAME}
        showPlaybackRateControl
        style={{width: "100%", borderRadius: 8, overflow: "hidden"}}
      />
      <PlayerReadout playerRef={playerRef} />

      <h2>Jump to a scene</h2>
      <p className="dim">
        Each tile is a <code>&lt;Thumbnail&gt;</code> of one frame. Clicking it calls{" "}
        <code>playerRef.current.seekTo(frame)</code>.
      </p>
      <div className="thumbnails">
        {chapters.map(({label, frame}) => (
          <button
            key={frame}
            type="button"
            className="thumbnail"
            onClick={() => playerRef.current?.seekTo(frame)}
          >
            <Thumbnail {...reel} frameToDisplay={frame} style={{width: "100%"}} />
            <span>
              {label} <span className="dim">· frame {frame}</span>
            </span>
          </button>
        ))}
      </div>
    </main>
  );
};

const container = document.getElementById("root");
if (!container) {
  throw new Error("player-demo: index.html has no #root element");
}
createRoot(container).render(<App />);
