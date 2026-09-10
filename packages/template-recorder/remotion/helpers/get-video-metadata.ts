import { ALL_FORMATS, Input, UrlSource } from "mediabunny";

export const getVideoMetadata = async ({
  src,
  includeDuration,
}: {
  src: string;
  includeDuration: boolean;
}) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(src),
  });

  try {
    const [videoTrack, durationInSeconds] = await Promise.all([
      input.getPrimaryVideoTrack(),
      includeDuration
        ? input
            .getDurationFromMetadata(undefined, { skipLiveWait: true })
            .then(
              (duration) =>
                duration ??
                input.computeDuration(undefined, { skipLiveWait: true }),
            )
        : null,
    ]);

    const dimensions = videoTrack
      ? {
          width: await videoTrack.getDisplayWidth(),
          height: await videoTrack.getDisplayHeight(),
        }
      : null;

    return {
      dimensions,
      durationInSeconds,
    };
  } finally {
    input.dispose();
  }
};
