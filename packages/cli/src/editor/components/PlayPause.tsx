import React, { useState, useCallback, useEffect } from "react";
import { useTimelinePosition, useVideoConfig } from "@jonny/motion-core";

export const PlayPause = () => {
  const [playing, setPlaying] = useState(false);
  const [frame, setFrame] = useTimelinePosition();
  const config = useVideoConfig();

  const toggle = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  useEffect(() => {
    if (playing) {
      setTimeout(() => {
        const nextFrame = frame + 1;
        if (nextFrame >= config.frames) {
          console.log("resetting", Date.now());
          return setFrame(0);
        }
        setFrame(frame + 1);
      }, 1000 / config.fps);
    }
  }, [frame, playing]);

  return (
    <button type="button" onClick={toggle}>
      {playing ? "Pause" : "Play"}
    </button>
  );
};
