import {test} from 'vitest';
import {extractFrameFromVideoCompositor} from '../compositor/extract-frame';

test('Should be able to extract frames from Rust', async () => {
	await extractFrameFromVideoCompositor();
});
