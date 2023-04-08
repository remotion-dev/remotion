import {test} from 'vitest';
import {extractFrameFromVideoCompositor} from '../compositor/extract-frame';

test('Should be able to extract frames from Rust', async () => {
	await extractFrameFromVideoCompositor({
		input: '/Users/jonathanburger/remotion/packages/example/public/framer.webm',
		output:
			'/Users/jonathanburger/remotion/packages/renderer/src/compositor/out.bmp',
		timeInSeconds: 100,
	});
});
