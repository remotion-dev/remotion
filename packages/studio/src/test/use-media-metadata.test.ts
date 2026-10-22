import {expect, test} from 'bun:test';
import {getFrameRateFromMetrics} from '../helpers/use-media-metadata';

test('uses Mediabunny bestGuessFrameRate when enough packets were probed', () => {
	expect(getFrameRateFromMetrics(null)).toBe(null);
	expect(
		getFrameRateFromMetrics({bestGuessFrameRate: 30, probedPacketCount: 1}),
	).toBe(null);
	expect(
		getFrameRateFromMetrics({
			bestGuessFrameRate: 59.94005994005994,
			probedPacketCount: 2,
		}),
	).toBe(59.94005994005994);
});
