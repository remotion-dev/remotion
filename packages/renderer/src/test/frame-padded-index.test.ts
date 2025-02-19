import {expect, test} from 'bun:test';
import {getFrameOutputFileName} from '../get-frame-padded-index';

test('Get frame padded index', () => {
	expect(
		getFrameOutputFileName({
			countType: 'from-zero',
			frame: 0,
			imageFormat: 'jpeg',
			index: 0,
			lastFrame: 100,
			totalFrames: 100,
		}),
	).toBe('element-00.jpeg');

	expect(
		getFrameOutputFileName({
			countType: 'from-zero',
			frame: 50,
			imageFormat: 'jpeg',
			index: 50,
			lastFrame: 100,
			totalFrames: 100,
		}),
	).toBe('element-50.jpeg');

	expect(
		getFrameOutputFileName({
			countType: 'actual-frames',
			frame: 50,
			imageFormat: 'jpeg',
			index: 50,
			lastFrame: 100,
			totalFrames: 101,
		}),
	).toBe('element-050.jpeg');
	expect(
		getFrameOutputFileName({
			countType: 'actual-frames',
			frame: 50,
			imageFormat: 'jpeg',
			index: 50,
			lastFrame: 99,
			totalFrames: 100,
		}),
	).toBe('element-50.jpeg');
});
