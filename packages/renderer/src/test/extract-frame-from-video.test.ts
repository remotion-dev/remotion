import path from 'path';
import {Readable} from 'stream';
import {
	extractFrameFromVideo,
	streamToString,
} from '../extract-frame-from-video';

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
	const stdout = await extractFrameFromVideo({
		ffmpegExecutable: null,
		src,
		time: 1,
	});

	const str = await streamToString(stdout as Readable);
	expect(str.length).toBe(10607);
});

test('Should get the last frame if out of range', async () => {
	const stdout = await extractFrameFromVideo({
		ffmpegExecutable: null,
		src,
		time: 100,
	});

	const str = await streamToString(stdout as Readable);
	expect(str.length).toBe(10805);
});
