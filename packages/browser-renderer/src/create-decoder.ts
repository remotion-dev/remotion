export const createDecoder = ({
  encoder,
  onProgress,
}: {
  encoder: VideoEncoder;
  onProgress: (decoded: number) => void;
}) => {
  let decodedFrames = 0;
  let nextKeyFrameTimestamp = 0;

  const decoder = new VideoDecoder({
    async output(inputFrame) {
      const bitmap = await createImageBitmap(inputFrame);

      const keyFrameEveryHowManySeconds = 2;
      let keyFrame = false;
      if (inputFrame.timestamp >= nextKeyFrameTimestamp) {
        keyFrame = true;
        nextKeyFrameTimestamp =
          inputFrame.timestamp + keyFrameEveryHowManySeconds * 1e6;
      }

      const outputFrame = new VideoFrame(bitmap, {
        timestamp: inputFrame.timestamp,
      });

      encoder.encode(outputFrame, { keyFrame });
      outputFrame.close();

      inputFrame.close();

      decodedFrames++;
      onProgress(decodedFrames);
    },
    error(error) {
      console.error(error);
    },
  });

  return { decoder };
};
