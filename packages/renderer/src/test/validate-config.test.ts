import {renderFrames} from '../render';

describe('Should validate invalid data passed to renderFrames', () => {
	test('Invalid FPS', () => {
		return expect(() =>
			// @ts-expect-error
			renderFrames({
				config: {
					durationInFrames: 100,
					fps: -1,
					height: 1000,
					width: 1000,
					id: 'hithere'
				},
			})
		).rejects.toThrow(
			/"fps" must be positive, but got -1 in the `config` object of `renderFrames\(\)`/
		);
	});
	test('Invalid durationInFrames', async () => {
		return expect(
			// @ts-expect-error
			renderFrames({
				config: {
					durationInFrames: 0.5,
					fps: 30,
					height: 1000,
					width: 1000,
					id: 'hithere'
				},
			})
		).rejects.toThrow(
			/The "durationInFrames" prop in the `config` object passed to `renderFrames\(\)` must be an integer, but got 0.5./
		);
	});
	test('Invalid height', async () => {
		return expect(
			// @ts-expect-error
			renderFrames({
				config: {
					durationInFrames: 1,
					fps: 30,
					height: 1000.5,
					width: 1000,
					id: 'hithere'
				},
			})
		).rejects.toThrow(
			/The "height" prop in the `config` object passed to `renderFrames\(\)` must be an integer, but is 1000.5./
		);
	});
	test('Invalid width', async () => {
		return expect(
			// @ts-expect-error
			renderFrames({
				config: {
					durationInFrames: 1,
					fps: 30,
					width: 1000.5,
					height: 1000,
					id: 'hithere'
				},
			})
		).rejects.toThrow(
			/The "width" prop in the `config` object passed to `renderFrames\(\)` must be an integer, but is 1000.5./
		);
	});
});
