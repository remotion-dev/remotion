import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {expect, test} from '@playwright/test';
import {rspack} from '@rspack/core';

// Use production React: development Fibers can retain debug owners independently
// of Sequence. Compile workspace sources so this tests the proposed core change.
for (const layout of ['none', 'absolute-fill'] as const) {
	for (const registration of [false, true]) {
		test(`Sequence releases replaced children (${layout}, registration=${registration})`, async ({
			page,
		}) => {
			const output = await fs.mkdtemp(
				path.join(os.tmpdir(), 'sequence-retention-'),
			);
			try {
				await new Promise<void>((resolve, reject) => {
					const compiler = rspack({
						context: import.meta.dirname,
						entry: './sequence-retention-app.tsx',
						mode: 'production',
						optimization: {minimize: true},
						output: {path: output, filename: 'app.js'},
						resolve: {
							extensions: ['.tsx', '.ts', '.js'],
							extensionAlias: {'.js': ['.ts', '.tsx', '.js']},
							alias: {
								'remotion/no-react$': path.resolve(
									import.meta.dirname,
									'../../core/src/no-react.ts',
								),
								remotion$: path.resolve(
									import.meta.dirname,
									'../../core/src/index.ts',
								),
								'@remotion/player$': path.resolve(
									import.meta.dirname,
									'../../player/src/index.ts',
								),
							},
						},
						module: {
							rules: [
								{
									test: /\.tsx?$/,
									use: [
										{
											loader: 'builtin:swc-loader',
											options: {
												jsc: {
													parser: {syntax: 'typescript', tsx: true},
													transform: {react: {runtime: 'automatic'}},
												},
											},
										},
									],
								},
							],
						},
					});
					compiler.run((error, stats) => {
						compiler.close(() => undefined);
						if (error || stats?.hasErrors())
							reject(error ?? new Error(stats?.toString()));
						else resolve();
					});
				});
				await page.setContent('<div id="root"></div>');
				await page.evaluate(
					(options) => {
						window.sequenceRetentionOptions = options;
					},
					{layout, registration},
				);
				await page.addScriptTag({
					content: await fs.readFile(path.join(output, 'app.js'), 'utf8'),
				});
				await expect(page.locator('#revision')).toHaveText('0');
				for (let revision = 1; revision <= 5; revision++) {
					await page.evaluate(
						(value) => window.sequenceRetention.replace(value),
						revision,
					);
					await expect(page.locator('#revision')).toHaveText(String(revision));
				}

				// Both the current and alternate React trees must have the final child.
				for (let i = 0; i < 2; i++) {
					await page.evaluate(() => window.sequenceRetention.flush());
					await page.evaluate(
						() =>
							new Promise((resolve) =>
								requestAnimationFrame(() => requestAnimationFrame(resolve)),
							),
					);
				}

				const cdp = await page.context().newCDPSession(page);
				try {
					await cdp.send('HeapProfiler.collectGarbage');
					await cdp.send('HeapProfiler.collectGarbage');
					expect(
						await page.evaluate(() =>
							window.sequenceRetention.refs.flatMap((ref, index) =>
								ref.deref() ? [index] : [],
							),
						),
					).toEqual([5]);
				} finally {
					await page.evaluate(() => window.sequenceRetention.unmount());
					await cdp.detach();
				}
			} finally {
				await fs.rm(output, {recursive: true, force: true});
			}
		});
	}
}
