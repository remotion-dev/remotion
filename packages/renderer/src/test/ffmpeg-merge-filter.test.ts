import {expect, test} from 'vitest';
import {createFfmpegMergeFilter} from '../create-ffmpeg-merge-filter';

test('FFMPEG merge filters', () => {
	expect(
		createFfmpegMergeFilter([
			{
				filter: {
					pad_end: '300',
					pad_start: null,
				},
				outName: '0.wav',
			},
			{
				filter: {
					pad_end: '600',
					pad_start: null,
				},
				outName: '1.wav',
			},
		])
	).toBe('[0:a][1:a]amix=inputs=2[a]');
});
