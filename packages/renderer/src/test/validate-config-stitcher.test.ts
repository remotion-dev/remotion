import {stitchFramesToVideo} from '../stitcher';

describe('Should validate invalid data passed to stitchFramesToVideo', () => {
	test('Invalid FPS', () => {
		return expect(() =>
			// @ts-expect-error
			stitchFramesToVideo({
				fps: -1,
				height: 1000,
				width: 1000,
			})
		).rejects.toThrow(
			/"fps" must be positive, but got -1 passed to `stitchFramesToVideo\(\)`/
		);
	});

	test('Invalid height', async () => {
		return expect(
			// @ts-expect-error
			stitchFramesToVideo({
				fps: 30,
				height: 1000.5,
				width: 1000,
			})
		).rejects.toThrow(
			/The "height" prop passed to `stitchFramesToVideo\(\)` must be an integer, but is 1000.5./
		);
	});
	test('Invalid width', async () => {
		return expect(
			// @ts-expect-error
			stitchFramesToVideo({
				fps: 30,
				width: 1000.5,
				height: 1000,
			})
		).rejects.toThrow(
			/The "width" prop passed to `stitchFramesToVideo\(\)` must be an integer, but is 1000.5./
		);
	});
});
