import { Composition, staticFile } from "remotion";
import { Visualizer } from "./Visualizer/Main";
import { visualizerCompositionSchema } from "./Visualizer/schema";
import { parseMedia } from "@remotion/media-parser";

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
            bassOverlay: true,
            type: "oscilloscope",
            color: "#0b84f3",
            windowInSeconds: 1,
            amplitude: 1.3,
          },
        }}
        // Determine the length of the video based on the duration of the audio file
        calculateMetadata={async ({ props }) => {
          console.log(new URL(props.audioFileUrl, window.location.origin).href);
          const { slowDurationInSeconds } = await parseMedia({
            src: new URL(props.audioFileUrl, window.location.origin).href,
            fields: {
              slowDurationInSeconds: true,
            },
            acknowledgeRemotionLicense: true,
          });

          return {
            durationInFrames: Math.floor(
              (slowDurationInSeconds - props.audioOffsetInSeconds) * FPS,
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
