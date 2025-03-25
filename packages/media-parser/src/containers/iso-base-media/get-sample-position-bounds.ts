import type {SamplePosition} from '../../get-sample-positions';

export const getSamplePositionBounds = (
	samplePositions: SamplePosition[],
	timescale: number,
) => {
	let min = Infinity;
	let max = -Infinity;

	for (const samplePosition of samplePositions) {
		if (samplePosition.cts < min) {
			min = samplePosition.cts;
		}

		if (samplePosition.cts > max) {
			max = samplePosition.cts;
		}
	}

	return {min: min / timescale, max: max / timescale};
};
