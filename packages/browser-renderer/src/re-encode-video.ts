import { DataStream, createFile, MP4MediaTrack, MP4VideoTrack } from "mp4box";
import { loadMp4File } from "./load-mp4-file";

export const reencodeVideo = async (file: File) => {
  const startNow = performance.now();

  let decodedFrameIndex = 0;
  let encodedFrameIndex = 0;
  let nextKeyFrameTimestamp = 0;
  let sampleDurations: number[] = [];

  const mp4boxOutputFile = createFile();

  const { info, mp4boxInputFile } = await loadMp4File(file);

  const track = info.videoTracks[0] as MP4MediaTrack;

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

      decodedFrameIndex++;
      displayProgress();
    },
    error(error) {
      console.error(error);
    },
  });

  let description;
  const trak = mp4boxInputFile.getTrackById(track.id);
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

  const encoder = new VideoEncoder({
    output(chunk, metadata) {
      let uint8 = new Uint8Array(chunk.byteLength);
      chunk.copyTo(uint8);

      const timescale = 90000;
      const description = (metadata.decoderConfig as VideoDecoderConfig)
        .description;
      const trackID = mp4boxOutputFile.addTrack({
        width: (track as MP4MediaTrack).track_width,
        height: (track as MP4MediaTrack).track_height,
        timescale,
        avcDecoderConfigRecord: description,
      });

      const sampleDuration =
        (sampleDurations.shift() as number) / (1_000_000 / timescale);
      mp4boxOutputFile.addSample(trackID, uint8, {
        duration: sampleDuration,
        is_sync: chunk.type === "key",
      });

      encodedFrameIndex++;
      displayProgress();
    },
    error(error) {
      console.error(error);
    },
  });

  encoder.configure({
    codec: "avc1.4d0034",
    width: track.track_width,
    height: track.track_height,
    hardwareAcceleration: "prefer-hardware",
    bitrate: 20_000_000,
  });

  mp4boxInputFile.setExtractionOptions(track.id, null, {
    nbSamples: Infinity,
  });

  function displayProgress() {
    console.log(
      `Decoding frame ${decodedFrameIndex} (${Math.round(
        (100 * decodedFrameIndex) / (track as MP4VideoTrack).nb_samples
      )}%)\nEncoding frame ${encodedFrameIndex} (${Math.round(
        (100 * encodedFrameIndex) / (track as MP4VideoTrack).nb_samples
      )}%)\n`
    );
  }

  mp4boxInputFile.onSamples = async (_track_id, _ref, samples) => {
    for (const sample of samples) {
      sampleDurations.push((sample.duration * 1_000_000) / sample.timescale);
      decoder.decode(
        new EncodedVideoChunk({
          type: sample.is_sync ? "key" : "delta",
          timestamp: (sample.cts * 1_000_000) / sample.timescale,
          duration: (sample.duration * 1_000_000) / sample.timescale,
          data: sample.data,
        })
      );
    }
    await decoder.flush();
    await encoder.flush();
    encoder.close();
    decoder.close();

    mp4boxOutputFile.save("mp4box.mp4");

    const seconds = (performance.now() - startNow) / 1000;

    console.log(
      `Re-encoded ${encodedFrameIndex} frames in ${
        Math.round(seconds * 100) / 100
      }s at ${Math.round(encodedFrameIndex / seconds)} fps`
    );
  };

  mp4boxInputFile.start();
};
