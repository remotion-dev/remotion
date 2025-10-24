import {
  Composition,
  continueRender,
  delayRender,
  getInputProps,
} from "remotion";
import { AIVideo, aiVideoSchema } from "./components/AIVideo";
import { useEffect, useMemo, useState } from "react";
import { FPS, WindowHeight, WindowWidth } from "./lib/constants";
import { getTimelinePath, loadTimelineFromFile } from "./lib/utils";

interface InputProps extends Record<string, unknown> {
  projectName?: string;
}

export const RemotionRoot: React.FC = () => {
  const inputProps = getInputProps<InputProps>();
  const [frameLength, setFrameLength] = useState(1);

  const resolvedProjectName = useMemo(
    () => inputProps.projectName ?? "history_of_venus",
    [inputProps],
  );

  useEffect(() => {
    const handle = delayRender("Calculating FPS duration...");

    const fetchConfig = async () => {
      const { lengthFrames } = await loadTimelineFromFile(
        getTimelinePath(resolvedProjectName),
      );
      setFrameLength(lengthFrames);
      continueRender(handle);
    };

    fetchConfig();

    return () => {
      continueRender(handle);
    };
  }, [resolvedProjectName]);

  return (
    <>
      <Composition
        id="AIVideo"
        component={AIVideo}
        durationInFrames={frameLength}
        fps={FPS}
        width={WindowWidth}
        height={WindowHeight}
        schema={aiVideoSchema}
        defaultProps={{
          projectName: resolvedProjectName,
        }}
      />
    </>
  );
};
