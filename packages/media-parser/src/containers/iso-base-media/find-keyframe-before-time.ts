import type {SamplePosition} from '../../get-sample-positions';

export const findKeyframeBeforeTime = ({
	samplePositions,
	time,
	timescale,
}: {
	samplePositions: SamplePosition[];
	time: number;
	timescale: number;
}) => {
	let byte = 0;
	let sam: SamplePosition | null = null;

	for (const sample of samplePositions) {
		const ctsInSeconds = sample.cts / timescale;
		const dtsInSeconds = sample.dts / timescale;

		if (
			(ctsInSeconds <= time || dtsInSeconds <= time) &&
			byte <= sample.offset &&
			sample.isKeyframe
		) {
			byte = sample.offset;
			sam = sample;
		}
	}

	if (!sam) {
		throw new Error('No sample found');
	}

	return sam;
};
