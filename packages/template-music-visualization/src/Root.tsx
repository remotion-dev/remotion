import { Composition, staticFile } from "remotion";
import { Visualizer } from "./Visualizer/Main";
import { visualizerCompositionSchema } from "./Visualizer/schema";
import { getAudioDurationInSeconds } from "@remotion/media-utils";

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Visualizer"
        component={Visualizer}
        width={1080}
        height={1080}
        schema={visualizerCompositionSchema}
        defaultProps={{
          // audio settings
          audioOffsetInSeconds: 0,
          audioFileUrl: staticFile("demo-track.mp3"),
          // song data
          coverImageUrl: staticFile("demo-song-cover.jpeg"),
          songName: "Sunset Render Deja Vu",
          artistName: "Remotion",
          textColor: "white",
          // visualizer settings
          visualizer: {
            type: "oscilloscope",
            color: "#0b84f3",
            windowInSeconds: 1,
            amplitude: 1.3,
          },
        }}
        // Determine the length of the video based on the duration of the audio file
        calculateMetadata={async ({ props }) => {
          const durationInSeconds = await getAudioDurationInSeconds(
            props.audioFileUrl,
          );

          return {
            durationInFrames: Math.floor(
              (durationInSeconds - props.audioOffsetInSeconds) * FPS,
            ),
            props: {
              ...props,
            },
            fps: FPS,
          };
        }}
      />
    </>
  );
};
