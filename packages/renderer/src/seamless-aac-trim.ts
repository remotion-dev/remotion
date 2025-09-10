export const getActualTrimLeft = ({
	fps,
	trimLeftOffset,
	seamless,
	assetDuration,
	audioStartFrame,
	trimLeft,
	playbackRate,
}: {
	trimLeft: number;
	audioStartFrame: number;
	fps: number;
	trimLeftOffset: number;
	seamless: boolean;
	assetDuration: number | null;
	playbackRate: number;
}): {
	trimLeft: number;
	maxTrim: number | null;
} => {
	const sinceStart = trimLeft - audioStartFrame;

	if (!seamless) {
		return {
			trimLeft:
				audioStartFrame / fps +
				(sinceStart / fps) * playbackRate +
				trimLeftOffset,
			maxTrim: assetDuration,
		};
	}

	if (seamless) {
		return {
			trimLeft:
				audioStartFrame / fps / playbackRate +
				sinceStart / fps +
				trimLeftOffset,
			maxTrim: assetDuration ? assetDuration / playbackRate : null,
		};
	}

	throw new Error('This should never happen');
};
