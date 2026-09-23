import {Player, Thumbnail} from "@remotion/player";
import type {CallbackListener, EventTypes, PlayerRef, RenderPoster} from "@remotion/player";
import {useCallback, useEffect, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {AbsoluteFill, useCurrentFrame} from "remotion";
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
const LAST_FRAME = reel.durationInFrames - 1;

// Frame 0 is the title's fade-in (almost empty), so the Player opens on a
// frame where the title is fully visible instead.
const INITIAL_FRAME = 45;

// One frame from the middle of four of the reel's scenes. Each scene is 75
// frames and the next one starts 15 frames before it ends (the transition),
// so scene n spans frames 60n to 60n + 74: that span is the inFrame/outFrame
// a tile gives the Player.
const chapters = [
  {label: "Title", frame: 45, inFrame: 0, outFrame: 74},
  {label: "Shapes", frame: 100, inFrame: 60, outFrame: 134},
  {label: "Captions", frame: 160, inFrame: 120, outFrame: 194},
  {label: "Route", frame: 220, inFrame: 180, outFrame: 254},
] as const;

// Every PlayerRef method that changes something. The getters are called by
// the readout below, after each event.
const methodButtons: {label: string; run: (player: PlayerRef, e: React.MouseEvent) => void}[] = [
  // play() and toggle() take the click event, so the Player can start its
  // audio inside the user gesture that browsers' autoplay policy asks for.
  {label: "play()", run: (player, e) => player.play(e)},
  {label: "pause()", run: (player) => player.pause()},
  {label: "toggle()", run: (player, e) => player.toggle(e)},
  // Does nothing unless the Player is playing.
  {label: "pauseAndReturnToPlayStart()", run: (player) => player.pauseAndReturnToPlayStart()},
  {label: "seekTo(0)", run: (player) => player.seekTo(0)},
  // With loop off, seeking to the last frame also fires "ended".
  {label: `seekTo(${LAST_FRAME})`, run: (player) => player.seekTo(LAST_FRAME)},
  {label: "mute()", run: (player) => player.mute()},
  {label: "unmute()", run: (player) => player.unmute()},
  {label: "setVolume(0.5)", run: (player) => player.setVolume(0.5)},
  {label: "setVolume(1)", run: (player) => player.setVolume(1)},
  {
    // The page's buttons are hidden while the Player is fullscreen, so
    // exitFullscreen() is called from a timer. It's skipped if Escape already
    // left fullscreen: document.exitFullscreen() rejects when nothing is.
    label: "requestFullscreen(), exitFullscreen() 3 s later",
    run: (player) => {
      player.requestFullscreen();
      setTimeout(() => {
        if (player.isFullscreen()) {
          player.exitFullscreen();
        }
      }, 3000);
    },
  },
];

// The page's CSS lives in index.html; these controls are styled inline, with
// its color variables.
const rowStyle: React.CSSProperties = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 14px", marginTop: 12};
const controlStyle: React.CSSProperties = {font: "13px/1.4 ui-monospace, monospace", color: "var(--text)"};
const buttonStyle: React.CSSProperties = {
  ...controlStyle,
  padding: "5px 9px",
  border: "1px solid var(--accent)",
  borderRadius: 6,
  background: "var(--bg-alt)",
  cursor: "pointer",
};

type Getters = {
  frame: number;
  playing: boolean;
  muted: boolean;
  volume: number;
  scale: number;
  fullscreen: boolean;
  container: string;
};

// Kept as a sibling of the <Player> so that frame updates re-render only this
// readout, not the Player (see remotion.dev/docs/player/best-practices).
const PlayerReadout: React.FC<{playerRef: React.RefObject<PlayerRef | null>}> = ({playerRef}) => {
  const [frame, setFrame] = useState(0);
  const [getters, setGetters] = useState<Getters | null>(null);
  const [events, setEvents] = useState<{type: EventTypes; text: string}[]>([]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    // Called after every event. Each thing the method buttons change fires
    // one (a volume change fires volumechange, fullscreen fires
    // fullscreenchange, …), so this always shows what the getters return now.
    const read = () => {
      const node = player.getContainerNode();
      setGetters({
        frame: player.getCurrentFrame(),
        playing: player.isPlaying(),
        muted: player.isMuted(),
        volume: player.getVolume(),
        scale: player.getScale(),
        fullscreen: player.isFullscreen(),
        container: node ? `${node.clientWidth}×${node.clientHeight}` : "null",
      });
    };
    // An event of the same type as the newest entry replaces it, so
    // timeupdate (4 times a second while playing), a volume-slider drag or a
    // window resize doesn't push every other event out.
    const log = (type: EventTypes, text: string) => {
      setEvents((prev) => [{type, text}, ...(prev[0]?.type === type ? prev.slice(1) : prev)].slice(0, 8));
      read();
    };
    const on = <T extends EventTypes>(type: T, callback: CallbackListener<T>) => {
      player.addEventListener(type, callback);
      return () => player.removeEventListener(type, callback);
    };

    setFrame(player.getCurrentFrame());
    read();
    // All 14 of the Player's events.
    const unsubscribe = [
      on("frameupdate", ({detail}) => {
        setFrame(detail.frame);
        read();
      }),
      on("timeupdate", ({detail}) => log("timeupdate", `timeupdate → frame ${detail.frame}`)),
      on("seeked", ({detail}) => log("seeked", `seeked → frame ${detail.frame}`)),
      on("play", () => log("play", `play from frame ${player.getCurrentFrame()}`)),
      on("pause", () => log("pause", `pause at frame ${player.getCurrentFrame()}`)),
      // No frame here: seekTo() fires "ended" before it moves the playhead.
      on("ended", () => log("ended", "ended")),
      on("ratechange", ({detail}) => log("ratechange", `ratechange → ${detail.playbackRate}×`)),
      on("volumechange", ({detail}) => log("volumechange", `volumechange → ${detail.volume}`)),
      on("mutechange", ({detail}) => log("mutechange", `mutechange → isMuted ${detail.isMuted}`)),
      on("fullscreenchange", ({detail}) =>
        log("fullscreenchange", `fullscreenchange → isFullscreen ${detail.isFullscreen}`),
      ),
      on("scalechange", ({detail}) => log("scalechange", `scalechange → ${detail.scale.toFixed(3)}`)),
      // Fired when the component throws. ShowcaseReel doesn't, so this one
      // stays quiet unless something breaks.
      on("error", ({detail}) => log("error", `error: ${detail.error.message}`)),
      // The Player is buffering (CaptionsScene's <Html5Video> loading) and
      // has stopped advancing, then carries on.
      on("waiting", () => log("waiting", "waiting (buffering)")),
      on("resume", () => log("resume", "resume (buffered)")),
    ];
    return () => unsubscribe.forEach((off) => off());
  }, [playerRef]);

  return (
    <div className="readout" aria-live="polite">
      <div>
        <span className="dim">frameupdate</span> frame <strong data-testid="frame">{frame}</strong> / {LAST_FRAME}
      </div>
      {getters ? (
        <div data-testid="getters">
          <span className="dim">getters</span> getCurrentFrame() {getters.frame} · isPlaying() {String(getters.playing)} ·
          isMuted() {String(getters.muted)} · getVolume() {getters.volume} · getScale() {getters.scale.toFixed(3)} ·
          isFullscreen() {String(getters.fullscreen)} · getContainerNode() {getters.container}
        </div>
      ) : null}
      <div data-testid="events">
        <span className="dim">last events</span> {events.length === 0 ? "none yet" : events.map((e) => e.text).join(" · ")}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);
  const [loop, setLoop] = useState(true);
  const [posterWhen, setPosterWhen] = useState({
    showPosterWhenUnplayed: true,
    showPosterWhenPaused: false,
    showPosterWhenEnded: true,
  });
  const [posterFillMode, setPosterFillMode] = useState<"player-size" | "composition-size">("player-size");
  const [chapter, setChapter] = useState<(typeof chapters)[number] | null>(null);

  // Stable, so the poster isn't a new element on every App render. It prints
  // the arguments the Player calls it with, as they arrive. With
  // posterFillMode "composition-size" that's 1280 and 720, and the poster is
  // scaled down with the video, text included. With "player-size" the Player
  // passes its style's width and height instead, not measured pixels: this
  // page sets width "100%" and no height, so the poster gets "100%" and
  // undefined, although RenderPoster types both as numbers.
  const renderPoster: RenderPoster = useCallback(
    ({width, height, isBuffering}) => (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          // Translucent, so the frame underneath still shows.
          background: "rgba(11, 17, 32, 0.6)",
          color: "#f8fafc",
          font: "20px system-ui, sans-serif",
          cursor: "pointer",
        }}
      >
        <div style={{fontSize: 56, lineHeight: 1}}>▶</div>
        <div style={{padding: "4px 12px", borderRadius: 6, background: "rgba(11, 17, 32, 0.85)"}}>
          renderPoster({"{"}width: {String(JSON.stringify(width))}, height: {String(JSON.stringify(height))}, isBuffering:{" "}
          {String(isBuffering)}
          {"}"})
        </div>
      </div>
    ),
    [],
  );

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
        // The owner uses Remotion's free license (see AGENTS.md); this hides the console notice.
        acknowledgeRemotionLicense
        loop={loop}
        // Only matters with loop off. The Player then stays on the frame it
        // ended on instead of jumping back to the start, and that's what
        // showPosterWhenEnded looks for: it checks for the reel's last frame.
        moveToBeginningWhenEnded={false}
        initialFrame={INITIAL_FRAME}
        inFrame={chapter ? chapter.inFrame : null}
        outFrame={chapter ? chapter.outFrame : null}
        renderPoster={renderPoster}
        {...posterWhen}
        posterFillMode={posterFillMode}
        showPlaybackRateControl
        style={{width: "100%", borderRadius: 8, overflow: "hidden"}}
      />

      <div style={rowStyle}>
        <label style={controlStyle}>
          <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} /> loop
        </label>
        {(["showPosterWhenUnplayed", "showPosterWhenPaused", "showPosterWhenEnded"] as const).map((prop) => (
          <label key={prop} style={controlStyle}>
            <input
              type="checkbox"
              checked={posterWhen[prop]}
              onChange={(e) => setPosterWhen({...posterWhen, [prop]: e.target.checked})}
            />{" "}
            {prop}
          </label>
        ))}
        {(["player-size", "composition-size"] as const).map((mode) => (
          <label key={mode} style={controlStyle}>
            <input
              type="radio"
              name="posterFillMode"
              checked={posterFillMode === mode}
              onChange={() => setPosterFillMode(mode)}
            />{" "}
            posterFillMode "{mode}"
          </label>
        ))}
      </div>
      <p className="dim" style={{marginTop: 8}}>
        <code>showPosterWhenEnded</code> needs loop off, and only applies when playback stops on frame {LAST_FRAME}:
        the Player compares against the reel's last frame, not <code>outFrame</code>.
      </p>

      <h2>PlayerRef methods</h2>
      <div style={rowStyle}>
        {methodButtons.map(({label, run}) => (
          <button
            key={label}
            type="button"
            style={buttonStyle}
            onClick={(e) => {
              if (playerRef.current) {
                run(playerRef.current, e);
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <PlayerReadout playerRef={playerRef} />

      <h2>Jump to a scene</h2>
      <p className="dim">
        Each tile is a <code>&lt;Thumbnail&gt;</code> of one frame. Clicking it sets the Player's{" "}
        <code>inFrame</code>/<code>outFrame</code> to that scene and calls <code>playerRef.current.seekTo(frame)</code>,
        so playback stays inside the scene: it loops there, or stops at <code>outFrame</code> with loop off. From
        there <code>play()</code> ends again after one frame, because it only rewinds from the reel's last frame, so
        click the tile again.
      </p>
      <div style={{...rowStyle, marginTop: 0, marginBottom: 12}}>
        <span style={controlStyle} data-testid="range">
          inFrame {chapter ? chapter.inFrame : "null"} · outFrame {chapter ? chapter.outFrame : "null"}
          {chapter ? ` (${chapter.label})` : " (whole reel)"}
        </span>
        <button
          type="button"
          style={{...buttonStyle, opacity: chapter ? 1 : 0.5}}
          disabled={!chapter}
          onClick={() => setChapter(null)}
        >
          Clear: whole reel
        </button>
      </div>
      <div className="thumbnails">
        {chapters.map((c) => (
          <button
            key={c.frame}
            type="button"
            className="thumbnail"
            aria-pressed={chapter === c}
            style={chapter === c ? {borderColor: "var(--accent-2)"} : undefined}
            onClick={() => {
              setChapter(c);
              playerRef.current?.seekTo(c.frame);
            }}
          >
            <Thumbnail
              {...reel}
              frameToDisplay={c.frame}
              style={{width: "100%"}}
              renderLoading={() => <span className="dim">loading…</span>}
              errorFallback={({error}) => <span>{error.message}</span>}
              overflowVisible
              noSuspense
              logLevel="warn"
            />
            <span>
              {c.label}{" "}
              <span className="dim">
                · frame {c.frame}, in/out {c.inFrame}–{c.outFrame}
              </span>
            </span>
          </button>
        ))}
      </div>

      <h2>Interface props</h2>
      <p className="dim">
        A second <code>&lt;Player&gt;</code> of the same reel: it starts playing muted (<code>autoPlay</code> needs{" "}
        <code>initiallyMuted</code> in most browsers), keeps its controls visible, and draws its own play, mute,
        fullscreen and volume controls through the <code>render*</code> props. Clicking the video doesn't toggle playback
        (<code>clickToPlay</code> is off) and neither does the space bar; double-clicking goes fullscreen.
      </p>
      <Player
        {...reel}
        controls
        // The owner uses Remotion's free license (see AGENTS.md); this hides the console notice.
        acknowledgeRemotionLicense
        autoPlay
        initiallyMuted
        loop
        showVolumeControls
        allowFullscreen
        clickToPlay={false}
        doubleClickToFullscreen
        spaceKeyToPlayOrPause={false}
        initiallyShowControls={5000}
        alwaysShowControls
        hideControlsWhenPointerDoesntMove={false}
        numberOfSharedAudioTags={2}
        sampleRate={48000}
        bufferStateDelayInMilliseconds={500}
        renderPoster={() => <AbsoluteFill style={{background: "#0b1120"}} />}
        showPosterWhenBuffering
        showPosterWhenBufferingAndPaused
        renderLoading={() => <AbsoluteFill style={{justifyContent: "center", alignItems: "center", color: "#94a3b8"}}>loading…</AbsoluteFill>}
        errorFallback={({error}) => <AbsoluteFill style={{justifyContent: "center", alignItems: "center", color: "#f87171"}}>{error.message}</AbsoluteFill>}
        renderPlayPauseButton={({playing, isBuffering}) => <span style={controlStyle}>{isBuffering ? "wait" : playing ? "pause" : "play"}</span>}
        renderMuteButton={({muted, volume}) => <span style={controlStyle}>{muted || volume === 0 ? "unmute" : "mute"}</span>}
        renderFullscreenButton={({isFullscreen}) => <span style={controlStyle}>{isFullscreen ? "exit full" : "full"}</span>}
        renderVolumeSlider={({volume, setVolume, inputRef, onBlur}) => (
          <input
            ref={inputRef}
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            aria-label="Volume"
            onBlur={onBlur}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        )}
        renderCustomControls={() => <span style={controlStyle}>custom control</span>}
        browserMediaControlsBehavior={{mode: "register-media-session"}}
        volumePersistenceKey="player-demo-interface"
        overrideInternalClassName="interface-player"
        overflowVisible
        noSuspense
        logLevel="warn"
        style={{width: "100%", borderRadius: 8, overflow: "hidden"}}
      />

      <h2>errorFallback</h2>
      <p className="dim">
        This Player's component throws from frame 5, and it opens on frame 5, so <code>errorFallback</code> replaces the
        video with its message.
      </p>
      <Player
        component={Broken}
        durationInFrames={30}
        compositionWidth={320}
        compositionHeight={180}
        fps={30}
        initialFrame={5}
        controls
        // The owner uses Remotion's free license (see AGENTS.md); this hides the console notice.
        acknowledgeRemotionLicense
        errorFallback={({error}) => (
          <AbsoluteFill style={{justifyContent: "center", alignItems: "center", background: "#1f2937", color: "#f87171", font: "14px ui-monospace, monospace"}}>
            errorFallback: {error.message}
          </AbsoluteFill>
        )}
        style={{width: 320, borderRadius: 8, overflow: "hidden"}}
      />
    </main>
  );
};

// Throws on purpose from frame 5, for the errorFallback demo.
const Broken: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= 5) {
    throw new Error("Broken throws at frame 5");
  }
  return <AbsoluteFill style={{background: "#111827"}} />;
};

const container = document.getElementById("root");
if (!container) {
  throw new Error("player-demo: index.html has no #root element");
}
createRoot(container).render(<App />);
