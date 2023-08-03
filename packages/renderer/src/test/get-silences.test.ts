import {test} from 'vitest';
import {
	getIdealMaximumFrameCacheItems,
	startLongRunningCompositor,
} from '../compositor/compositor';
import {exampleVideos} from './example-videos';

test(
	'Should be able to get the silences from a video',
	async () => {
		const compositor = startLongRunningCompositor(
			getIdealMaximumFrameCacheItems(),
			'verbose',
			false
		);

		const res = await compositor.executeCommand('GetSilences', {
			src: exampleVideos.music,
			original_src: exampleVideos.music,
		});
		console.log(res);

		compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 10000}
);
