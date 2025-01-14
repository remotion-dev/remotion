const getUnroundedMpegFrameLength = ({
	samplesPerFrame,
	bitrateKbit,
	samplingFrequency,
	padding,
	layer,
}: {
	samplesPerFrame: number;
	bitrateKbit: number;
	samplingFrequency: number;
	padding: boolean;
	layer: number;
}) => {
	if (layer === 1) {
		throw new Error('MPEG Layer I is not supported');
	}

	return (
		(((samplesPerFrame / 8) * bitrateKbit) / samplingFrequency) * 1000 +
		(padding ? (layer === 1 ? 4 : 1) : 0)
	);
};

export const getAverageMpegFrameLength = ({
	samplesPerFrame,
	bitrateKbit,
	samplingFrequency,
	layer,
}: {
	samplesPerFrame: number;
	bitrateKbit: number;
	samplingFrequency: number;
	layer: number;
}) => {
	const withoutPadding = getUnroundedMpegFrameLength({
		bitrateKbit,
		layer,
		padding: false,
		samplesPerFrame,
		samplingFrequency,
	});
	const rounded = Math.floor(withoutPadding);

	const rest = withoutPadding % 1;
	return rest * (rounded + 1) + (1 - rest) * rounded;
};

export const getMpegFrameLength = ({
	samplesPerFrame,
	bitrateKbit,
	samplingFrequency,
	padding,
	layer,
}: {
	samplesPerFrame: number;
	bitrateKbit: number;
	samplingFrequency: number;
	padding: boolean;
	layer: number;
}) => {
	return Math.floor(
		getUnroundedMpegFrameLength({
			bitrateKbit,
			layer,
			padding,
			samplesPerFrame,
			samplingFrequency,
		}),
	);
};
