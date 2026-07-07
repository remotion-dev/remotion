import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';

const commonFpsValues = [
	24000 / 1001,
	24,
	25,
	30000 / 1001,
	30,
	50,
	60000 / 1001,
	60,
];

const snapToCommonFps = (fps: number) => {
	return (
		commonFpsValues.find((commonFps) => Math.abs(fps - commonFps) < 0.01) ?? fps
	);
};

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
				width: await videoTrack.getDisplayWidth(),
				height: await videoTrack.getDisplayHeight(),
			}
		: null;
	const packetStats = await videoTrack?.computePacketStats(50);
	const fps = packetStats
		? snapToCommonFps(packetStats.averagePacketRate)
		: null;

	return {
		durationInSeconds,
		dimensions,
		fps,
	};
};
