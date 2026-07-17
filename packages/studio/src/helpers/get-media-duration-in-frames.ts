export const getMediaDurationInFrames = ({
	durationInSeconds,
	fps,
}: {
	durationInSeconds: number;
	fps: number;
}) => {
	return Number((durationInSeconds * fps).toFixed(10));
};
