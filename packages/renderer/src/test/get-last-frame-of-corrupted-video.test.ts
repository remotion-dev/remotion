import path from 'path';
import {test} from 'vitest';
import {cleanDownloadMap, makeDownloadMap} from '../assets/download-map';
import {getLastFrameOfVideo} from '../extract-frame-from-video';

test('Get last frame of corrupted video', async () => {
	const downloadMap = makeDownloadMap();
	await getLastFrameOfVideo({
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
		downloadMap,
	});
	cleanDownloadMap(downloadMap);
}, 90000);
