import type {InputVideoTrack} from 'mediabunny';

const isPresent = <T>(value: T | null | undefined) => {
	return value !== undefined && value !== null;
};

const hasColorSpaceMetadata = (colorSpace: VideoColorSpaceInit) => {
	return (
		isPresent(colorSpace.matrix) ||
		isPresent(colorSpace.primaries) ||
		isPresent(colorSpace.transfer) ||
		isPresent(colorSpace.fullRange)
	);
};

export const shouldFallbackForUntaggedSdH264 = async (
	videoTrack: InputVideoTrack,
) => {
	if ((await videoTrack.getCodec()) !== 'avc') {
		return false;
	}

	if (hasColorSpaceMetadata(await videoTrack.getColorSpace())) {
		return false;
	}

	const [width, height] = await Promise.all([
		videoTrack.getSquarePixelWidth(),
		videoTrack.getSquarePixelHeight(),
	]);

	return Math.min(width, height) <= 576 && Math.max(width, height) <= 1024;
};
