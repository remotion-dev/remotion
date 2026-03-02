import {expect, test} from 'bun:test';
import path from 'path';
import {ensureBrowser} from '../ensure-browser';
import {renderStill} from '../render-still';

const exampleBuild = path.join(__dirname, '..', '..', '..', 'example', 'build');

test(
	'Need to pass valid metadata',
	async () => {
		await ensureBrowser();

		await expect(() =>
			renderStill({
				composition: {
					width: NaN,
					height: 1000,
					fps: 30,
					durationInFrames: 30,
					id: 'hithere',
					defaultProps: {},
					props: {},
					defaultCodec: null,
					defaultOutName: null,
					defaultVideoImageFormat: null,
					defaultPixelFormat: null,
					defaultProResProfile: null,
				},
				frame: 0,
				output: '/file/output.png',
				serveUrl: exampleBuild,
				verbose: false,
			}),
		).toThrow(/not be NaN, but is NaN/);
	},
	{
		timeout: 30000,
	},
);

test(
	'Returns buffer in promise result',
	async () => {
		await ensureBrowser();

		const {buffer, contentType} = await renderStill({
			composition: {
				width: 1000,
				height: 1000,
				fps: 30,
				durationInFrames: 30,
				id: 'react-svg',
				defaultProps: {},
				props: {},
				defaultCodec: null,
				defaultOutName: null,
				defaultVideoImageFormat: null,
				defaultPixelFormat: null,
				defaultProResProfile: null,
			},
			frame: 0,
			serveUrl: exampleBuild,
			verbose: false,
		});
		expect(buffer?.length).toBeGreaterThan(1000);
		expect(contentType).toBe('image/png');
	},
	{
		timeout: 30000,
	},
);

test(
	'Need to pass valid metadata',
	async () => {
		await ensureBrowser();

		await expect(() =>
			renderStill({
				composition: {
					width: 1000,
					height: 1000,
					fps: 30,
					durationInFrames: 30,
					id: 'hithere',
					defaultProps: {},
					props: {},
					defaultCodec: null,
					defaultOutName: null,
					defaultVideoImageFormat: null,
					defaultPixelFormat: null,
					defaultProResProfile: null,
				},
				frame: 200,
				output: '/file/output.png',
				serveUrl: exampleBuild,
				verbose: false,
			}),
		).toThrow(
			/Cannot use frame 200: Duration of composition is 30, therefore the highest frame that can be rendered is 29/,
		);
	},
	{timeout: 30000},
);

test(
	'Catches invalid image format',
	async () => {
		await ensureBrowser();

		return expect(() =>
			renderStill({
				composition: {
					width: 1000,
					height: 1000,
					fps: 30,
					durationInFrames: 30,
					id: 'hithere',
					defaultProps: {},
					props: {},
					defaultCodec: null,
					defaultOutName: null,
					defaultVideoImageFormat: null,
					defaultPixelFormat: null,
					defaultProResProfile: null,
				},
				// @ts-expect-error
				imageFormat: 'jjj',
				frame: 200,
				output: '/file/output.png',
				serveUrl: exampleBuild,
			}),
		).toThrow(/Image format should be one of: "png", "jpeg", "pdf", "webp"/);
	},
	{
		timeout: 30000,
	},
);
