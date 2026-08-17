export const getAudioSamplePosition = ({
	frame,
	fps,
	sampleRate,
}: {
	frame: number;
	fps: number;
	sampleRate: number;
}) => {
	const position = (frame / fps) * sampleRate;
	const rounded = Math.round(position);
	return Math.floor(
		Math.abs(position - rounded) < 0.00001 ? rounded : position,
	);
};
