export const frameToFfmpegTimestamp = (time: number) => {
	// We ceil because FFMPEG seeks to the closest frame BEFORE the position
	return (Math.ceil(time * 1_000_000) / 1_000).toFixed(3) + 'ms';
};
