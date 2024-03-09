import { MP4File, Sample } from "mp4box";

export const getSamples = (mp4File: MP4File) => {
  return new Promise<Sample[]>((resolve, reject) => {
    mp4File.onSamples = async (_track_id, _ref, samples) => {
      resolve(samples);
      mp4File.onSamples = undefined;
      mp4File.onError = undefined;
    };
    mp4File.onError = (e) => {
      reject(e);
      mp4File.onSamples = undefined;
      mp4File.onError = undefined;
    };

    mp4File.start();
  });
};
