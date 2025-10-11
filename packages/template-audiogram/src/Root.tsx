import { Composition, staticFile } from "remotion";
import { Audiogram } from "./Audiogram/Main";
import { audiogramSchema } from "./Audiogram/schema";
import { getSubtitles } from "./helpers/fetch-captions";
import { FPS } from "./helpers/ms-to-frame";
import { parseMedia } from "@remotion/media-parser";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Audiogram"
        component={Audiogram}
        width={1080}
        height={1080}
        schema={audiogramSchema}
        defaultProps={{
          // audio settings
          audioOffsetInSeconds: 0,
          audioFileUrl: staticFile("audio.wav"),
          // podcast data
          coverImageUrl: staticFile("podcast-cover.jpeg"),
          titleText: "Ep 550 - Supper Club × Remotion React",
          titleColor: "rgba(186, 186, 186, 0.93)",
          // captions settings
          captions: null,
          captionsFileName: staticFile("captions.json"),
          onlyDisplayCurrentSentence: true,
          captionsTextColor: "rgba(255, 255, 255, 0.93)",
          // visualizer settings
          visualizer: {
            type: "oscilloscope",
            color: "#F4B941",
            numberOfSamples: "64" as const,
            windowInSeconds: 0.1,
            posterization: 3,
            amplitude: 4,
            padding: 50,
          },
        }}
        // Determine the length of the video based on the duration of the audio file
        calculateMetadata={async ({ props }) => {
          const captions = await getSubtitles(props.captionsFileName);
          const { slowDurationInSeconds } = await parseMedia({
            src: props.audioFileUrl,
            acknowledgeRemotionLicense: true,
            fields: {
              slowDurationInSeconds: true,
            },
          });

          return {
            durationInFrames: Math.floor(
              (slowDurationInSeconds - props.audioOffsetInSeconds) * FPS,
            ),
            props: {
              ...props,
              captions,
            },
            fps: FPS,
          };
        }}
      />
    </>
  );
};
