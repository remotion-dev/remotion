import {beforeAll, expect, spyOn, test} from 'bun:test';
import {existsSync} from 'fs';
import os from 'os';
import path from 'path';
import {
	ensureBrowser,
	openBrowser,
	renderStill,
	selectComposition,
} from '@remotion/renderer';
import {NoReactInternals} from 'remotion/no-react';

const exampleBuild = path.join(__dirname, '..', '..', '..', 'example', 'build');

beforeAll(async () => {
	await ensureBrowser();
});

test('Render video with browser instance open', async () => {
	const puppeteerInstance = await openBrowser('chrome');
	try {
		const reactSvg = await selectComposition({
			id: 'react-svg',
			serveUrl: exampleBuild,
			puppeteerInstance,
			inputProps: {},
		});

		const tmpDir = os.tmpdir();

		const outPath = path.join(tmpDir, 'out.mp4');
		const originalFetch = globalThis.fetch;
		const fetchSpy = spyOn(globalThis, 'fetch').mockImplementation(((
			input,
			init,
		) => {
			if (String(input).startsWith('https://www.remotion.pro/api/track/')) {
				return Promise.resolve(
					new Response(
						JSON.stringify({
							success: true,
							billable: false,
							classification: 'development',
						}),
					),
				);
			}

			return originalFetch(input, init);
		}) as typeof fetch);
		const warnSpy = spyOn(console, 'warn').mockImplementation(() => undefined);

		try {
			const {buffer} = await renderStill({
				output: outPath,
				serveUrl: exampleBuild,
				composition: reactSvg,
				puppeteerInstance,
				licenseKey: 'free-license',
				logLevel: 'warn',
			});
			expect(buffer).toBe(null);
			const licensingCall = fetchSpy.mock.calls.find(([input]) =>
				String(input).startsWith('https://www.remotion.pro/api/track/'),
			);
			expect(licensingCall).toBeDefined();
			expect(JSON.parse(String(licensingCall?.[1]?.body))).toMatchObject({
				apiKey: null,
				event: 'cloud-render',
				host: null,
				isStill: true,
			});
			expect(
				warnSpy.mock.calls.some((args) =>
					args.join(' ').includes('Pass "licenseKey" to renderStill()'),
				),
			).toBe(false);
		} finally {
			fetchSpy.mockRestore();
			warnSpy.mockRestore();
		}
	} finally {
		await puppeteerInstance.close({silent: false});
	}
});

test('Render still with browser instance not open and legacy webpack config', async () => {
	const warnSpy = spyOn(console, 'warn').mockImplementation(() => undefined);
	const reactSvg = await selectComposition({
		id: 'react-svg',
		serveUrl: exampleBuild,
		inputProps: {},
	});

	const tmpDir = os.tmpdir();

	const outPath = path.join(tmpDir, 'subdir', 'out.jpg');

	try {
		await renderStill({
			output: outPath,
			serveUrl: exampleBuild,
			composition: reactSvg,
			logLevel: 'warn',
		});
		expect(existsSync(outPath)).toBe(true);
		expect(
			warnSpy.mock.calls.some((args) =>
				args.join(' ').includes('Pass "licenseKey" to renderStill()'),
			),
		).toBe(NoReactInternals.ENABLE_V5_BREAKING_CHANGES);
	} finally {
		warnSpy.mockRestore();
	}
});
