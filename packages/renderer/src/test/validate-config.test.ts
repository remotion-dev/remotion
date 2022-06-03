import {renderFrames} from '../render-frames';
import {expectToThrow} from './expect-to-throw';

describe('Should validate invalid data passed to renderFrames', () => {
	test('Invalid FPS', () => {
		return expectToThrow(
			() =>
				// @ts-expect-error
				renderFrames({
					composition: {
						durationInFrames: 100,
						fps: -1,
						height: 1000,
						width: 1000,
						id: 'hithere',
					},
				}),
			/"fps" must be positive, but got -1 in the `config` object of `renderFrames\(\)`/
		);
	});
	test('Invalid durationInFrames', () => {
		return expectToThrow(
			() =>
				// @ts-expect-error
				renderFrames({
					composition: {
						durationInFrames: 0.5,
						fps: 30,
						height: 1000,
						width: 1000,
						id: 'hithere',
					},
				}),
			/The "durationInFrames" prop in the `config` object passed to `renderFrames\(\)` must be an integer, but got 0.5./
		);
	});
	test('Invalid height', () => {
		return expectToThrow(
			() =>
				// @ts-expect-error
				renderFrames({
					config: {
						durationInFrames: 1,
						fps: 30,
						height: 1000.5,
						width: 1000,
						id: 'hithere',
					},
				}),
			/The "height" prop in the `config` object passed to `renderFrames\(\)` must be an integer, but is 1000.5./
		);
	});
	test('Invalid width', () => {
		return expectToThrow(
			() =>
				// @ts-expect-error
				renderFrames({
					config: {
						durationInFrames: 1,
						fps: 30,
						width: 1000.5,
						height: 1000,
						id: 'hithere',
					},
				}),
			/The "width" prop in the `config` object passed to `renderFrames\(\)` must be an integer, but is 1000.5./
		);
	});
});
