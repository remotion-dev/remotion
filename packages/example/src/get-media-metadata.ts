import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';

export const getMediaMetadata = async (src: string) => {
	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(src, {
			getRetryDelay: () => null,
		}),
	});

	const durationInSeconds = await input.computeDuration();
	const videoTrack = await input.getPrimaryVideoTrack();
	const dimensions = videoTrack
		? {
				width: videoTrack.displayWidth,
				height: videoTrack.displayHeight,
			}
		: null;
	const packetStats = await videoTrack?.computePacketStats(50);
	const fps = packetStats?.averagePacketRate ?? null;

	return {
		durationInSeconds,
		dimensions,
		fps,
	};
};
