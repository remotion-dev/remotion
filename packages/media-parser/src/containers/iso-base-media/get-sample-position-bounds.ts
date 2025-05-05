import type {SamplePosition} from '../../get-sample-positions';

export const getSamplePositionBounds = (
	samplePositions: SamplePosition[],
	timescale: number,
) => {
	let min = Infinity;
	let max = -Infinity;

	for (const samplePosition of samplePositions) {
		const timestampMin = Math.min(samplePosition.cts, samplePosition.dts);
		const timestampMax =
			Math.max(samplePosition.cts, samplePosition.dts) +
			(samplePosition.duration ?? 0);

		if (timestampMin < min) {
			min = timestampMin;
		}

		if (timestampMax > max) {
			max = timestampMax;
		}
	}

	return {min: min / timescale, max: max / timescale};
};
