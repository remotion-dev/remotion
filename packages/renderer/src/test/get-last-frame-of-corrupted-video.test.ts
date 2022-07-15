import path from 'path';
import {test} from 'vitest';
import {getLastFrameOfVideo} from '../extract-frame-from-video';

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
		imageFormat: 'png',
		specialVCodecForTransparency: 'none',
		needsResize: null,
	});
}, 90000);
