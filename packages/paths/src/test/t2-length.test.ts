import {expect, test} from 'vitest';
import {getCubicArcLength, t2length} from '../helpers/bezier-functions';

test('Should return correct t2 length', () => {
	const t = t2length(31.027579786958654, 31.027579786958654, (i) =>
		getCubicArcLength(
			[0, 1.4210854715202004e-14, 44.77152501692068, 100],
			[100, 155.22847498307934, 200, 200],
			i
		)
	);

	expect(t).toBe(0.19299625445015836);
});

test('Should return correct t2 length', () => {
	const t = t2length(32.04874064070666, 32.04874064070666, (i) =>
		getCubicArcLength(
			[0, 1.4210854715202004e-14, 44.77152501692068, 100],
			[100, 155.22847498307934, 200, 200],
			i
		)
	);

	expect(t).toBe(0.19931688495710795);
});
