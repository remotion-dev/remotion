import {expect, test} from 'vitest';
import {getSilentParts} from '../get-silent-parts';
import {exampleVideos} from './example-videos';

test(
	'Should be able to get the silences from a video',
	async () => {
		const res = await getSilentParts({src: exampleVideos.webcam});

		expect(res).toEqual([{start: 0, end: 1.0149}]);
	},
	{timeout: 10000}
);
