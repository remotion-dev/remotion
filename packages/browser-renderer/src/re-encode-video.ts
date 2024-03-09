import type { MP4MediaTrack } from "mp4box";
import { DataStream } from "mp4box";
import { createEncoder } from "./encode";
import { getSamples } from "./get-samples";
import { loadMp4File } from "./load-mp4-file";

export const reencodeVideo = async (file: File) => {
  const startNow = performance.now();

  let decodedFrames = 0;
  let encodedFrames = 0;
  let nextKeyFrameTimestamp = 0;

  const sampleDurations: number[] = [];

  const { info, mp4File } = await loadMp4File(file);
  const track = info.videoTracks[0] as MP4MediaTrack;

  function displayProgress() {
    const decodingProgress = Math.round(
      (100 * decodedFrames) / track.nb_samples,
    );

    const encodingProgress = Math.round(
      (100 * encodedFrames) / track.nb_samples,
    );

    console.log(`Decoding frame ${decodedFrames} (${decodingProgress}%)`);
    console.log(`Encoding frame ${encodedFrames} (${encodingProgress}%)`);
  }

  const { encoder, outputMp4 } = createEncoder({
    width: track.track_width,
    height: track.track_height,
    sampleDurations,
    onProgress: (encoded) => {
      encodedFrames = encoded;
      displayProgress();
    },
  });

  const decoder = new VideoDecoder({
    async output(inputFrame) {
      const bitmap = await createImageBitmap(inputFrame);

      const outputFrame = new VideoFrame(bitmap, {
        timestamp: inputFrame.timestamp,
      });

      const keyFrameEveryHowManySeconds = 2;
      let keyFrame = false;
      if (inputFrame.timestamp >= nextKeyFrameTimestamp) {
        keyFrame = true;
        nextKeyFrameTimestamp =
          inputFrame.timestamp + keyFrameEveryHowManySeconds * 1e6;
      }

      encoder.encode(outputFrame, { keyFrame });
      inputFrame.close();
      outputFrame.close();

      decodedFrames++;
      displayProgress();
    },
    error(error) {
      console.error(error);
    },
  });

  let description;
  const trak = mp4File.getTrackById(track.id);
  for (const entry of trak.mdia.minf.stbl.stsd.entries) {
    if (entry.avcC || entry.hvcC) {
      const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
      if (entry.avcC) {
        entry.avcC.write(stream);
      } else if (entry.hvcC) {
        entry.hvcC.write(stream);
      }

      description = new Uint8Array(stream.buffer, 8); // Remove the box header.
      break;
    }
  }

  decoder.configure({
    codec: track.codec,
    codedWidth: track.track_width,
    codedHeight: track.track_height,
    hardwareAcceleration: "prefer-hardware",
    description,
  });

  mp4File.setExtractionOptions(track.id, null, {
    nbSamples: Infinity,
  });

  const samples = await getSamples(mp4File);

  for (const sample of samples) {
    sampleDurations.push((sample.duration * 1_000_000) / sample.timescale);
    decoder.decode(
      new EncodedVideoChunk({
        type: sample.is_sync ? "key" : "delta",
        timestamp: (sample.cts * 1_000_000) / sample.timescale,
        duration: (sample.duration * 1_000_000) / sample.timescale,
        data: sample.data,
      }),
    );
  }

  await decoder.flush();
  await encoder.flush();
  encoder.close();
  decoder.close();

  outputMp4.save("mp4box.mp4");

  const seconds = (performance.now() - startNow) / 1000;

  console.log(
    `Re-encoded ${encodedFrames} frames in ${
      Math.round(seconds * 100) / 100
    }s at ${Math.round(encodedFrames / seconds)} fps`,
  );
};
