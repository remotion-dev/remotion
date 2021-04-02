import React, {
  useCallback,
  Suspense,
  useEffect,
  useContext
} from "react";
import { Internals } from "remotion";

export type Props = {
  slides: {
      imageUrl: string;
      caption: string;
      transition: string;
    }[]
};

let lastFrames: number[] = [];

const setLastFrames = (n: number[]) => {
  lastFrames = n;
  lastFrames = lastFrames.slice(Math.max(lastFrames.length - 15, 0));
};

const Loading: React.FC = () => <h1>Loading…</h1>;

const VideoPreview: React.FC<Props> = ({ slides }) => {
  const { setCurrentComposition, currentComposition } = useContext(
    Internals.CompositionManager
  );
  const config = Internals.useUnsafeVideoConfig();
  const [playing, setPlaying] = Internals.Timeline.usePlayingState();
  const frame = Internals.Timeline.useTimelinePosition();
  const setFrame = Internals.Timeline.useTimelineSetFrame();
  const video = Internals.useVideo();
  const VideoComponent = video ? video.component : null;
  const toggle = useCallback(() => {
    if (!video) {
      return null;
    }
    setPlaying((p) => {
      if (p) {
        setLastFrames([]);
      }
      return !p;
    });
  }, [video, setPlaying]);
  useEffect(() => {
    if (!currentComposition) {
      setCurrentComposition("car-slideshow");
    }

    if (!config) {
      return;
    }

    if (playing) {
      setLastFrames([...lastFrames, Date.now()]);
      const last10Frames = lastFrames;
      const timesBetweenFrames: number[] = last10Frames
        .map((f, i) => {
          if (i === 0) {
            return null;
          }
          return f - last10Frames[i - 1];
        })
        .filter((_t) => _t !== null) as number[];
      const averageTimeBetweenFrames =
        timesBetweenFrames.reduce((a, b) => {
          return a + b;
        }, 0) / timesBetweenFrames.length;
      const expectedTime = 1000 / config.fps;
      const slowerThanExpected = averageTimeBetweenFrames - expectedTime;
      const timeout =
        last10Frames.length === 0
          ? expectedTime
          : expectedTime - slowerThanExpected;
      const duration = config.durationInFrames;
      const t = setTimeout(() => {
        setFrame((currFrame) => {
          const nextFrame = currFrame + 1;
          if (nextFrame >= duration) {
            return 0;
          }
          return currFrame + 1;
        });
      }, timeout);
      return () => void clearTimeout(t);
    }
  }, [config, frame, playing, setFrame, video, currentComposition, setCurrentComposition]);

  return (
    <Suspense fallback={Loading}>
      <h1>Remotion Video Player</h1>
      <div
        style={{
          position: "relative",
          width: config?.width,
          height: config?.height,
          overflow: "hidden"
        }}
      >
        <button
          style={{
            position: "absolute",
            left: "10px",
            top: "10px",
            zIndex: 100
          }}
          onClick={toggle}
        >
          {playing ? "pause" : "play"}
        </button>
        {VideoComponent ? (
          <VideoComponent {...(((video?.props as unknown) as {}) ?? {})} />
        ) : null}
      </div>
    </Suspense>
  );
};

export default VideoPreview;
