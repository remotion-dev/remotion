import path from 'path';
import {expect, test} from 'vitest';
import {makeDownloadMap} from '../assets/download-map';
import {extractFrameFromVideo} from '../extract-frame-from-video';

const src = path.join(
	__dirname,
	'..',
	'..',
	'..',
	'example',
	'public',
	'framermp4withoutfileextension'
);

test('Should be able to extract a frame from a video', async () => {
	const str = await extractFrameFromVideo({
		ffmpegExecutable: null,
		ffprobeExecutable: null,
		src,
		time: 1,
		imageFormat: 'jpeg',
		downloadMap: makeDownloadMap(),
	});

	expect(str.length).toBeGreaterThan(10000);
});

test('Should be able to extract a frame from a video as PNG', async () => {
	const str = await extractFrameFromVideo({
		ffmpegExecutable: null,
		ffprobeExecutable: null,
		src,
		time: 1,
		imageFormat: 'png',
		downloadMap: makeDownloadMap(),
	});

	expect(str.length).toBeGreaterThan(10000);
});

test('Should get the last frame if out of range', async () => {
	const str = await extractFrameFromVideo({
		ffmpegExecutable: null,
		ffprobeExecutable: null,
		src,
		time: 100,
		imageFormat: 'jpeg',
		downloadMap: makeDownloadMap(),
	});

	expect(str.length).toBeGreaterThan(10000);
});
