import path from 'path';
import {getLastFrameOfVideo} from '../extract-frame-from-video';

jest.setTimeout(60000);

test('Get last frame of corrupted video', async () => {
	await getLastFrameOfVideo({
		ffmpegExecutable: null,
		ffprobeExecutable: null,
		offset: 0,
		src: path.join(
			__dirname,
			'..',
			'..',
			'..',
			'example',
			'public',
			'corrupted.mp4'
		),
	});
});
