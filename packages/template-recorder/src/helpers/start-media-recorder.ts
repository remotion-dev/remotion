import { CurrentRecorder } from "../RecordButton";
import { StreamState } from "../state/media-sources";
import {
  findGoodSupportedCodec,
  getExtension,
} from "./find-good-supported-codec";
import { Prefix } from "./prefixes";
import { createFileStorage } from "./store-file";

const mediaRecorderOptions: MediaRecorderOptions = {
  audioBitsPerSecond: 128000,
  videoBitsPerSecond: 8 * 4000000,
  // @ts-expect-error - not in the types yet
  videoKeyFrameIntervalDuration: 2 * 1000,
};

export type FinishedRecording = {
  prefix: string;
  data: () => Promise<Blob>;
  releaseData: () => Promise<void>;
  endDate: number;
  mimeType: string;
};

export const startMediaRecorder = async ({
  prefix,
  timestamp,
  source,
}: {
  prefix: Prefix;
  timestamp: number;
  source: StreamState;
}): Promise<CurrentRecorder | null> => {
  if (source.type !== "loaded") {
    throw new Error(`Source not loaded for ${prefix}`);
  }

  const mimeType = findGoodSupportedCodec(
    source.stream.getAudioTracks().length > 0,
  );

  const completeMediaRecorderOptions = {
    ...mediaRecorderOptions,
    mimeType,
  };

  const extension = getExtension(mimeType);
  const filename = `${prefix}${timestamp}.${extension}`;

  const recorder = new MediaRecorder(
    source.stream,
    completeMediaRecorderOptions,
  );
  const writer = await createFileStorage(`${filename}`);

  const periodicSaveController = new AbortController();

  recorder.addEventListener(
    "dataavailable",
    ({ data }) => {
      writer.write(data).then(() => {
        console.log("Data written", filename, writer.getBytesWritten());
      });
    },
    {
      signal: periodicSaveController.signal,
    },
  );

  const stopAndWaitUntilDone = () => {
    periodicSaveController.abort();
    const { resolve, reject, promise } =
      Promise.withResolvers<FinishedRecording>();
    const controller = new AbortController();

    recorder.stop();
    recorder.addEventListener(
      "error",
      (event) => {
        console.log(event);
        reject(new Error(`Error recording ${prefix}`));
      },
      {
        once: true,
        signal: controller.signal,
      },
    );
    recorder.addEventListener(
      "dataavailable",
      ({ data }) => {
        writer
          .write(data)
          .then(() => {
            console.log(
              "Final Data written",
              filename,
              writer.getBytesWritten(),
            );
            resolve({
              prefix,
              data: () => writer.save(),
              endDate: Date.now(),
              releaseData: () => writer.release(),
              mimeType,
            });
          })
          .catch((err) => reject(err));
      },
      {
        once: true,
        signal: controller.signal,
      },
    );

    promise.finally(() => controller.abort());

    return promise;
  };

  // Trigger a save every 10 seconds
  recorder.start(10_000);

  return { recorder, stopAndWaitUntilDone, mimeType };
};
