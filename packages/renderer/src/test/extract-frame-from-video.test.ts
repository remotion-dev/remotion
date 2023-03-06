import path from 'path';
import {expect, test} from 'vitest';
import {cleanDownloadMap, makeDownloadMap} from '../assets/download-map';
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
	const downloadMap = makeDownloadMap();
	const str = await extractFrameFromVideo({
		src,
		time: 1,
		imageFormat: 'jpeg',
		downloadMap,
		remotionRoot: process.cwd(),
	});

	cleanDownloadMap(downloadMap);

	expect(str.length).toBeGreaterThan(10000);
});

test('Should be able to extract a frame from a video as PNG', async () => {
	const downloadMap = makeDownloadMap();

	const str = await extractFrameFromVideo({
		src,
		time: 1,
		imageFormat: 'png',
		downloadMap,
		remotionRoot: process.cwd(),
	});
	cleanDownloadMap(downloadMap);

	expect(str.length).toBeGreaterThan(10000);
});

test('Should get the last frame if out of range', async () => {
	const downloadMap = makeDownloadMap();

	const str = await extractFrameFromVideo({
		src,
		time: 100,
		imageFormat: 'jpeg',
		downloadMap,
		remotionRoot: process.cwd(),
	});

	cleanDownloadMap(downloadMap);

	expect(str.length).toBeGreaterThan(10000);
});
