import {
  Composition,
  continueRender,
  delayRender,
  getInputProps,
} from "remotion";
import { AIVideo, aiVideoSchema } from "./components/AIVideo";
import { useEffect, useState } from "react";
import { FPS, WindowHeight, WindowWidth } from "./lib/constants";
import { getTimelinePath, loadTimelineFromFile } from "./lib/utils";

interface InputProps extends Record<string, unknown> {
  projectDir?: string;
  hasWatermark?: boolean;
}

export const RemotionRoot: React.FC = () => {
  const inputProps = getInputProps<InputProps>();
  const [frameLength, setFrameLength] = useState(1);

  const projectDir = inputProps.projectDir ?? "history_of_venus";

  useEffect(() => {
    const handle = delayRender("Calculating FPS duration...");

    const fetchConfig = async () => {
      const { lengthFrames } = await loadTimelineFromFile(
        getTimelinePath(projectDir),
      );
      setFrameLength(lengthFrames);
      continueRender(handle);
    };

    fetchConfig();

    return () => {
      continueRender(handle);
    };
  }, []);

  return (
    <>
      <Composition
        id="AIVideo"
        component={AIVideo}
        durationInFrames={frameLength}
        fps={FPS}
        width={WindowWidth}
        height={WindowHeight}
        // @ts-expect-error zod version mismatch
        schema={aiVideoSchema}
        defaultProps={{
          projectName: projectDir,
          hasWatermark: !!inputProps.hasWatermark,
        }}
      />
    </>
  );
};
