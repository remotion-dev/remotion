import {expect, test} from 'bun:test';
import {
	getLoopDisplayWidth,
	shouldTileLoopDisplay,
} from '../components/looped-media-timeline';

test('Should only tile media if more than one loop is visible', () => {
	expect(shouldTileLoopDisplay(undefined)).toBe(false);
	expect(
		shouldTileLoopDisplay({
			durationInFrames: 100,
			numberOfTimes: 0.5,
			startOffset: 0,
		}),
	).toBe(false);
	expect(
		shouldTileLoopDisplay({
			durationInFrames: 100,
			numberOfTimes: 1,
			startOffset: 0,
		}),
	).toBe(false);
	expect(
		shouldTileLoopDisplay({
			durationInFrames: 100,
			numberOfTimes: 2,
			startOffset: 0,
		}),
	).toBe(true);
});

test('Should calculate loop width from visible repeats', () => {
	expect(
		getLoopDisplayWidth({
			visualizationWidth: 300,
			loopDisplay: {
				durationInFrames: 100,
				numberOfTimes: 3,
				startOffset: 0,
			},
		}),
	).toBe(100);
	expect(
		getLoopDisplayWidth({
			visualizationWidth: 300,
			loopDisplay: {
				durationInFrames: 100,
				numberOfTimes: 0.5,
				startOffset: 0,
			},
		}),
	).toBe(300);
});
