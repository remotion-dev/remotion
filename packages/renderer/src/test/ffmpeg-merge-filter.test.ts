import {expect, test} from 'vitest';
import {createFfmpegMergeFilter} from '../create-ffmpeg-merge-filter';

test('FFMPEG merge filters', () => {
	expect(createFfmpegMergeFilter(2)).toBe(
		'[0:a][1:a]amix=inputs=2,pan=stereo[a]'
	);
	expect(createFfmpegMergeFilter(3)).toBe(
		'[0:a][1:a]amix=inputs=3,pan=stereo[a]'
	);
	expect(createFfmpegMergeFilter(4)).toBe(
		'[0:a][1:a]amix=inputs=4,pan=stereo[a]'
	);
});
