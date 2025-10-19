import {
  Composition,
  continueRender,
  delayRender,
  getInputProps,
  staticFile,
} from "remotion";
import { AIVideo, aiVideoSchema } from "./AIVideo";
import { useCallback, useEffect, useState } from "react";
import { Timeline } from "./types";
import { FPS } from "./constants";

interface InputProps extends Record<string, unknown> {
  timelineFileName?: string;
  hasWatermark?: boolean;
}

export const RemotionRoot: React.FC = () => {
  const inputProps = getInputProps<InputProps>();
  const [frameLength, setFrameLength] = useState(1);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [handle] = useState(() => delayRender());

  const fetchConfig = useCallback(
    async (props: InputProps) => {
      const timelineFile =
        props.timelineFileName ?? "content/demo/timeline.json";
      const res = await fetch(staticFile(timelineFile));
      const json = await res.json();

      const newTimeline = json as Timeline;
      newTimeline.elements.sort((a, b) => a.startMs - b.startMs);

      const lengthMs =
        newTimeline.elements[newTimeline.elements.length - 1].endMs / 1000;
      const legthFrames = Math.floor(lengthMs * FPS);

      setFrameLength(legthFrames);
      setTimeline(newTimeline);

      continueRender(handle);
    },
    [handle],
  );

  useEffect(() => {
    fetchConfig(inputProps);
  }, [inputProps, fetchConfig]);

  return (
    <>
      <Composition
        id="AIVideo"
        component={AIVideo}
        durationInFrames={frameLength}
        fps={FPS}
        width={1080}
        height={1920}
        schema={aiVideoSchema}
        defaultProps={{
          timeline: timeline!,
          hasWatermark: inputProps.hasWatermark,
        }}
      />
    </>
  );
};
