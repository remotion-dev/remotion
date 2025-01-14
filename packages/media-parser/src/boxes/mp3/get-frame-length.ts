export const getMpegFrameLength = ({
	samplesPerFrame,
	bitrateKbit,
	samplingFrequency,
	padding,
}: {
	samplesPerFrame: number;
	bitrateKbit: number;
	samplingFrequency: number;
	padding: boolean;
}) => {
	return (
		Math.floor(
			(((samplesPerFrame / 8) * bitrateKbit) / samplingFrequency) * 1000,
		) + (padding ? 1 : 0)
	);
};
