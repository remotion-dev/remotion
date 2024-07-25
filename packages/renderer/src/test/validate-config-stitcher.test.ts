import {describe, expect, test} from 'bun:test';
import {stitchFramesToVideo} from '../stitch-frames-to-video';

describe('Should validate invalid data passed to stitchFramesToVideo', () => {
	test('Invalid FPS', () => {
		return expect(() =>
			// @ts-expect-error
			stitchFramesToVideo({
				fps: -1,
				height: 1000,
				width: 1000,
			}),
		).toThrow(
			/"fps" must be positive, but got -1 in `stitchFramesToVideo\(\)`/,
		);
	});

	test('Invalid height', () => {
		return expect(
			// @ts-expect-error
			stitchFramesToVideo({
				fps: 30,
				height: 1000.5,
				width: 1000,
			}),
		).rejects.toThrow(
			/The "height" prop passed to `stitchFramesToVideo\(\)` must be an integer, but is 1000.5./,
		);
	});
	test('Invalid width', () => {
		return expect(
			// @ts-expect-error
			stitchFramesToVideo({
				fps: 30,
				width: 1000.5,
				height: 1000,
			}),
		).rejects.toThrow(
			/The "width" prop passed to `stitchFramesToVideo\(\)` must be an integer, but is 1000.5./,
		);
	});
});
