import {expect, test} from 'vitest';
import {cleanDownloadMap, makeDownloadMap} from '../assets/download-map';
import {renderStill} from '../render-still';

test('Need to pass valid metadata', async () => {
	const downloadMap = makeDownloadMap();
	await expect(() =>
		renderStill({
			composition: {
				width: NaN,
				height: 1000,
				fps: 30,
				durationInFrames: 30,
				id: 'hithere',
				defaultProps: undefined,
			},
			frame: 0,
			output: '/file/output.png',
			serveUrl: 'https://gleaming-wisp-de5d2a.netlify.app/',
			downloadMap,
		})
	).rejects.toThrow(/not be NaN, but is NaN/);
	cleanDownloadMap(downloadMap);
});

test('Returns buffer in promise result', async () => {
	const downloadMap = makeDownloadMap();
	const {buffer} = await renderStill({
		composition: {
			width: 1000,
			height: 1000,
			fps: 30,
			durationInFrames: 30,
			id: 'react-svg',
			defaultProps: undefined,
		},
		frame: 0,
		serveUrl: 'https://gleaming-wisp-de5d2a.netlify.app/',
		downloadMap,
	});
	expect(buffer?.length).toBeGreaterThan(1000);
	cleanDownloadMap(downloadMap);
});

test('Need to pass valid metadata', async () => {
	const downloadMap = makeDownloadMap();
	await expect(() =>
		renderStill({
			composition: {
				width: 1000,
				height: 1000,
				fps: 30,
				durationInFrames: 30,
				id: 'hithere',
				defaultProps: undefined,
			},
			frame: 200,
			output: '/file/output.png',
			serveUrl: 'https://gleaming-wisp-de5d2a.netlify.app/',
			downloadMap,
		})
	).rejects.toThrow(
		/Cannot use frame 200: Duration of composition is 30, therefore the highest frame that can be rendered is 29/
	);
	cleanDownloadMap(downloadMap);
});

test('Catches invalid image format', () => {
	return expect(() =>
		renderStill({
			composition: {
				width: 1000,
				height: 1000,
				fps: 30,
				durationInFrames: 30,
				id: 'hithere',
				defaultProps: undefined,
			},
			// @ts-expect-error
			imageFormat: 'jjj',
			frame: 200,
			output: '/file/output.png',
			serveUrl: 'https://gleaming-wisp-de5d2a.netlify.app/',
		})
	).rejects.toThrow(/Image format should be either "png" or "jpeg"/);
});
