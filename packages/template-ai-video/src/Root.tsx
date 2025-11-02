import { Composition } from "remotion";
import { AIVideo, aiVideoSchema } from "./components/AIVideo";
import { FPS } from "./lib/constants";
import { getTimelinePath, loadTimelineFromFile } from "./lib/utils";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AIVideo"
        component={AIVideo}
        fps={FPS}
        width={1080}
        height={1920}
        schema={aiVideoSchema}
        defaultProps={{
          projectName: "history_of_venus",
          timeline: null,
        }}
        calculateMetadata={async ({ props }) => {
          const { lengthFrames, timeline } = await loadTimelineFromFile(
            getTimelinePath(props.projectName),
          );

          return {
            durationInFrames: lengthFrames,
            props: {
              ...props,
              timeline,
            },
          };
        }}
      />
    </>
  );
};
