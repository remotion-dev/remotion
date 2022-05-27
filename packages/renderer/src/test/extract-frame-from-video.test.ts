import path from 'path';
import {extractFrameFromVideo} from '../extract-frame-from-video';

jest.setTimeout(30000);

const src = path.join(
	__dirname,
	'..',
	'..',
	'..',
	'example',
	'public',
	'framer.mp4'
);
test('Should be able to extract a frame from a video', async () => {
	const str = await extractFrameFromVideo({
		ffmpegExecutable: null,
		src,
		time: 1,
	});

	expect(str.length).toBeGreaterThan(10000);
});

test('Should get the last frame if out of range', async () => {
	const str = await extractFrameFromVideo({
		ffmpegExecutable: null,
		src,
		time: 100,
	});

	expect(str.length).toBeGreaterThan(10000);
});
