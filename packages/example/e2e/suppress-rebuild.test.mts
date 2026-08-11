import fs from 'fs';
import path from 'path';
import {expect, test} from '@playwright/test';
import {exampleDir, rootFile, STUDIO_URL} from './constants.mts';
import {readStudioLogs, stripAnsi} from './helpers.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.describe('suppress webpack rebuild', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('only source file changes should trigger a bundler rebuild', async () => {
		const logCountBefore = readStudioLogs().length;

		// 1. Update default props via the studio API
		const currentContent = fs.readFileSync(rootFile, 'utf-8');
		const currentDelay = currentContent.match(/delay:\s*(\d+)/)?.[1];
		const newDelay = currentDelay === '99' ? 98 : 99;

		const res = await fetch(`${STUDIO_URL}/api/update-default-props`, {
			method: 'POST',
			headers: {'content-type': 'application/json', origin: STUDIO_URL},
			body: JSON.stringify({
				compositionId: 'schema-test',
				defaultProps: JSON.stringify({
					title: 'sdassdfsdfdsf',
					delay: newDelay,
					color: 'rgba(251, 255, 0, 0.46)',
					list: [{name: 'first', age: 55}],
					matrix: [0.75, 1, 1, 0],
					description:
						'Sample description \nOn multiple linesfdaf\n\ndsfdsafdfsasdf',
					dropdown: 'a',
				}),
				enumPaths: [['matrix'], ['dropdown']],
			}),
		});
		const json = await res.json();
		expect(json.success).toBe(true);

		// Wait for the file to be written
		await expect
			.poll(
				() => {
					const content = fs.readFileSync(rootFile, 'utf-8');
					return content.includes(`delay: ${newDelay}`);
				},
				{
					message: `Expected E2eTestRoot.tsx to contain "delay: ${newDelay}"`,
					timeout: 10_000,
				},
			)
			.toBe(true);

		// Wait for the suppression log to appear (confirming the plugin handled it)
		await expect
			.poll(
				() => {
					const newLogs = readStudioLogs().slice(logCountBefore).map(stripAnsi);
					return newLogs.some((log) =>
						log.includes('[WatchIgnoreNextChange] All changes suppressed'),
					);
				},
				{
					message:
						'Expected "[WatchIgnoreNextChange] All changes suppressed" log',
					timeout: 10_000,
				},
			)
			.toBe(true);

		// Verify no "Built in" log appeared after the suppression
		const logsAfterApiUpdate = readStudioLogs()
			.slice(logCountBefore)
			.map(stripAnsi);
		const suppressionIndex = logsAfterApiUpdate.findIndex((log) =>
			log.includes('[WatchIgnoreNextChange] All changes suppressed'),
		);
		const logsAfterSuppression = logsAfterApiUpdate.slice(suppressionIndex + 1);
		const hadRebuildAfterSuppression = logsAfterSuppression.some((log) =>
			log.includes('Built in'),
		);
		expect(hadRebuildAfterSuppression).toBe(false);

		// 2. Now manually edit the file — this SHOULD trigger a rebuild
		const logCountBeforeManualEdit = readStudioLogs().length;
		const contentBeforeEdit = fs.readFileSync(rootFile, 'utf-8');
		const editedContent = contentBeforeEdit.replace(
			`delay: ${newDelay}`,
			`delay: ${newDelay + 1}`,
		);
		fs.writeFileSync(rootFile, editedContent);

		// Wait for webpack to rebuild
		await expect
			.poll(
				() => {
					const newLogs = readStudioLogs()
						.slice(logCountBeforeManualEdit)
						.map(stripAnsi);
					return newLogs.some((log) => log.includes('Built in'));
				},
				{
					message: 'Expected webpack to rebuild after manual file edit',
					timeout: 15_000,
				},
			)
			.toBe(true);

		// 3. A config edit should be handled by the dedicated config watcher,
		// without also triggering a bundler rebuild through Tailwind's scanner.
		const configFile = path.join(exampleDir, 'remotion.config.ts');
		const configBeforeEdit = fs.readFileSync(configFile, 'utf-8');
		const logCountBeforeConfigEdit = readStudioLogs().length;

		try {
			fs.writeFileSync(configFile, `${configBeforeEdit}\n`);

			await expect
				.poll(
					() => {
						const newLogs = readStudioLogs()
							.slice(logCountBeforeConfigEdit)
							.map(stripAnsi);
						return newLogs.some((log) => log.includes('Config file changed'));
					},
					{
						message: 'Expected the config watcher to handle the config edit',
						timeout: 10_000,
					},
				)
				.toBe(true);

			await new Promise((resolve) => setTimeout(resolve, 2_000));

			const logsAfterConfigEdit = readStudioLogs()
				.slice(logCountBeforeConfigEdit)
				.map(stripAnsi);
			expect(
				logsAfterConfigEdit.some(
					(log) => log.includes('Building...') || log.includes('Built in'),
				),
			).toBe(false);
		} finally {
			fs.writeFileSync(configFile, configBeforeEdit);
		}
	});
});
