import {
  Composition,
  continueRender,
  delayRender,
  getInputProps,
} from "remotion";
import { AIVideo, aiVideoSchema } from "./AIVideo";
import { useEffect, useState } from "react";
import { FPS, WindowsHeight, WindowsWidth } from "./constants";
import { loadTimelineFromFile } from "./utils";

interface InputProps extends Record<string, unknown> {
  timelineFileName?: string;
  hasWatermark?: boolean;
}

export const RemotionRoot: React.FC = () => {
  const inputProps = getInputProps<InputProps>();
  const [frameLength, setFrameLength] = useState(1);

  const timelineFile =
    inputProps.timelineFileName ?? "content/demo/timeline.json";

  useEffect(() => {
    const handle = delayRender("Calculating FPS duration...");

    const fetchConfig = async () => {
      const { lengthFrames } = await loadTimelineFromFile(timelineFile);
      setFrameLength(lengthFrames);
      continueRender(handle);
    };

    fetchConfig();

    return () => {
      continueRender(handle);
    };
  }, [timelineFile]);

  return (
    <>
      <Composition
        id="AIVideo"
        component={AIVideo}
        durationInFrames={frameLength}
        fps={FPS}
        width={WindowsWidth}
        height={WindowsHeight}
        schema={aiVideoSchema}
        defaultProps={{
          timelineFile,
          hasWatermark: !!inputProps.hasWatermark,
        }}
      />
    </>
  );
};
