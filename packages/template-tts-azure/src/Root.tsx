import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { Composition } from "remotion";
import { waitForNoInput } from "./debounce";
import { HelloWorld } from "./HelloWorld";
import { audioAlreadyExists, createS3Url, synthesizeSpeech } from "./tts";
import { compSchema } from "./types";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          text: "Working with TTS (Azure + AWS S3)",
          titleColor: "black",
          voice: "enUSWoman1" as const,
          displaySpeed: 10,
        }}
        calculateMetadata={async ({ props, abortSignal, isRendering }) => {
          // don't debounce user input during rendering
          if (!isRendering) {
            await waitForNoInput(abortSignal, 1000);
          }

          const exists = await audioAlreadyExists({
            text: props.text,
            voice: props.voice,
          });
          if (!exists) {
            await synthesizeSpeech(props.text, props.voice);
          }

          const fileName = createS3Url({
            text: props.text,
            voice: props.voice,
          });

          const duration = await getAudioDurationInSeconds(fileName);

          return { props, durationInFrames: Math.ceil(duration * 30) };
        }}
        schema={compSchema}
      />
    </>
  );
};
