import {expect, test} from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import {ensureBrowser} from '../ensure-browser';
import {renderStill} from '../render-still';

const exampleBuild = path.join(__dirname, '..', '..', '..', 'example', 'build');
const expectedImage = path.join(__dirname, '__fixtures__', 'book-flip.png');

const composition = {
	width: 540,
	height: 280,
	fps: 30,
	durationInFrames: 60,
	id: 'book-flip-transition-doc-thumb',
	defaultProps: {},
	props: {},
	defaultCodec: null,
	defaultOutName: null,
	defaultVideoImageFormat: null,
	defaultPixelFormat: null,
	defaultProResProfile: null,
	defaultSampleRate: null,
};

test(
	'bookFlip matches the reference image',
	async () => {
		await ensureBrowser();

		const {buffer, contentType} = await renderStill({
			composition,
			frame: 15,
			serveUrl: exampleBuild,
			chromiumOptions: {
				gl: 'angle',
			},
			chromeMode: 'chrome-for-testing',
			verbose: false,
		});

		expect(contentType).toBe('image/png');
		expect(buffer).not.toBeNull();
		expect([...buffer!]).toEqual([...fs.readFileSync(expectedImage)]);
	},
	{timeout: 120000},
);
