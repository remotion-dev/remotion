import {beforeAll, expect, test} from 'bun:test';
import {ensureBrowser} from '../ensure-browser';
import {renderStill} from '../render-still';

beforeAll(async () => {
	await ensureBrowser();
});

test(
	'Need to pass valid metadata',
	async () => {
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
				},
				frame: 0,
				output: '/file/output.png',
				serveUrl:
					'https://661808694cad562ef2f35be7--incomparable-dasik-a4482b.netlify.app/',
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
		const {buffer} = await renderStill({
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
			},
			frame: 0,
			serveUrl:
				'https://661808694cad562ef2f35be7--incomparable-dasik-a4482b.netlify.app/',
			verbose: false,
		});
		expect(buffer?.length).toBeGreaterThan(1000);
	},
	{
		timeout: 30000,
	},
);

test(
	'Need to pass valid metadata',
	async () => {
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
				},
				frame: 200,
				output: '/file/output.png',
				serveUrl:
					'https://661808694cad562ef2f35be7--incomparable-dasik-a4482b.netlify.app/',
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
	() => {
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
				},
				// @ts-expect-error
				imageFormat: 'jjj',
				frame: 200,
				output: '/file/output.png',
				serveUrl:
					'https://661808694cad562ef2f35be7--incomparable-dasik-a4482b.netlify.app/',
			}),
		).toThrow(/Image format should be one of: "png", "jpeg", "pdf", "webp"/);
	},
	{
		timeout: 30000,
	},
);
