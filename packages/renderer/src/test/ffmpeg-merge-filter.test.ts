import {expect, test} from 'vitest';
import {createFfmpegMergeFilter} from '../create-ffmpeg-merge-filter';

test('FFMPEG merge filters', () => {
	expect(createFfmpegMergeFilter(2)).toBe(
		'[0:a][1:a]amerge=inputs=2,pan=stereo|c0=c0+c2|c1=c1+c3[a]'
	);
	expect(createFfmpegMergeFilter(3)).toBe(
		'[0:a][1:a]amerge=inputs=3,pan=stereo|c0=c0+c2+c4|c1=c1+c3+c5[a]'
	);
	expect(createFfmpegMergeFilter(4)).toBe(
		'[0:a][1:a]amerge=inputs=4,pan=stereo|c0=c0+c2+c4+c6|c1=c1+c3+c5+c7[a]'
	);
});
