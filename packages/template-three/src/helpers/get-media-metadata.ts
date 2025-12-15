import { Input, ALL_FORMATS, UrlSource } from "mediabunny";

export const getMediaMetadata = async (src: string) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(src, {
      getRetryDelay: () => null,
    }),
  });

  const durationInSeconds = await input.computeDuration();
  const videoTrack = await input.getPrimaryVideoTrack();
  if (!videoTrack) {
    throw new Error(`Video track not found in source: ${src}`);
  }
  const dimensions = {
    width: videoTrack.displayWidth,
    height: videoTrack.displayHeight,
  };
  const packetStats = await videoTrack.computePacketStats(50);
  const fps = packetStats?.averagePacketRate ?? null;

  return {
    durationInSeconds,
    dimensions,
    fps,
  };
};

export type MediabunnyMetadata = Awaited<ReturnType<typeof getMediaMetadata>>;
