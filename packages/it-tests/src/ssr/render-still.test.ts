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

const exampleBuild = path.join(__dirname, '..', '..', '..', 'example', 'build');

beforeAll(async () => {
	await ensureBrowser();
});

test('Render still with a legacy license key and an open browser', async () => {
	const puppeteerInstance = await openBrowser('chrome');
	try {
		const reactSvg = await selectComposition({
			id: 'react-svg',
			serveUrl: exampleBuild,
			puppeteerInstance,
			inputProps: {},
		});

		const tmpDir = os.tmpdir();

		const outPath = path.join(tmpDir, 'out.png');
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
		const infoSpy = spyOn(console, 'log');

		try {
			const {buffer} = await renderStill({
				output: outPath,
				serveUrl: exampleBuild,
				composition: reactSvg,
				puppeteerInstance,
				licenseKey: 'rm_sec_test',
			});
			expect(buffer).toBe(null);
			const licensingCall = fetchSpy.mock.calls.find(([input]) =>
				String(input).startsWith('https://www.remotion.pro/api/track/'),
			);
			expect(licensingCall).toBeUndefined();
			expect(infoSpy).toHaveBeenCalledWith(
				"Still renders don't need to be tracked anymore, an unlimited amount is now included in any Remotion License. You can now remove `licenseKey` from renderStill().",
			);
		} finally {
			fetchSpy.mockRestore();
			infoSpy.mockRestore();
		}
	} finally {
		await puppeteerInstance.close({silent: false});
	}
});

test('Render still without a license key or an open browser', async () => {
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
		).toBe(false);
	} finally {
		warnSpy.mockRestore();
	}
});
