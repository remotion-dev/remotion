import {expect, test} from 'bun:test';
import {warpPath} from '../warp-path';

test('Should be able to warp path', () => {
	expect(
		warpPath('M 0 0 L 0 100', ({x, y}) => ({
			x: x + Math.sin(y / 4) * 5,
			y,
		})),
	).toStartWith('M 0 0 L 0.970365514464549');
});
