import {expect, test} from 'bun:test';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderMedia, selectComposition} from '@remotion/renderer';

test(
	'renderMedia() rejects two artifacts with the same filename on the same frame',
	async () => {
		const directory = mkdtempSync(path.join(tmpdir(), 'duplicate-artifacts-'));
		const browser = await openBrowser('chrome');
		try {
			const serveUrl = await bundle({
				entryPoint: path.join(__dirname, 'fixtures', 'duplicate-artifacts.tsx'),
				outDir: path.join(directory, 'bundle'),
				enableCaching: false,
			});
			const composition = await selectComposition({
				serveUrl,
				id: 'duplicate-artifacts',
				puppeteerInstance: browser,
			});
			const emitted: string[] = [];

			await expect(
				renderMedia({
					composition,
					serveUrl,
					codec: 'h264',
					outputLocation: path.join(directory, 'out.mp4'),
					puppeteerInstance: browser,
					logLevel: 'error',
					onArtifact: (artifact) => {
						emitted.push(artifact.filename);
					},
				}),
			).rejects.toThrow(/Artifacts must have unique names/);
			expect(emitted).toEqual(['captions.srt']);
		} finally {
			await browser.close({silent: true});
			rmSync(directory, {recursive: true, force: true});
		}
	},
	{timeout: 60000},
);
