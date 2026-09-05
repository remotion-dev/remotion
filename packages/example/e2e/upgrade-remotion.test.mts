import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {expect, test} from '@playwright/test';
import {e2eEntryPoint, exampleDir, remotionBin} from './constants.mts';

test('upgrade progress survives closing settings and offers a graceful shutdown', async ({
	page,
}) => {
	test.setTimeout(120_000);
	const portServer = createServer();
	await new Promise<void>((resolve) =>
		portServer.listen(0, '127.0.0.1', resolve),
	);
	const address = portServer.address();
	if (!address || typeof address === 'string') throw new Error('No test port');
	await new Promise<void>((resolve) => portServer.close(() => resolve()));
	const studioUrl = `http://localhost:${address.port}`;
	const studio = spawn(
		remotionBin,
		[
			'studio',
			e2eEntryPoint,
			'--port',
			String(address.port),
			'--no-open',
			'--force-new',
		],
		{cwd: exampleDir, stdio: 'pipe'},
	);
	let logs = '';
	studio.stdout.on('data', (data: Buffer) => {
		logs += data.toString();
	});
	studio.stderr.on('data', (data: Buffer) => {
		logs += data.toString();
	});
	const exited = new Promise<number | null>((resolve) =>
		studio.once('exit', resolve),
	);
	try {
		await expect.poll(() => logs, {timeout: 60000}).toContain('Built in');
		await page.route('**/api/update-available', (route) =>
			route.fulfill({
				json: {
					success: true,
					data: {
						currentVersion: '4.0.520',
						latestVersion: '4.0.521',
						updateAvailable: true,
						skillsUpdateAvailable: false,
						timedOut: false,
						packageManager: 'bun',
					},
				},
			}),
		);
		await page.route('**/api/release-notes', (route) =>
			route.fulfill({
				json: {success: true, data: {releases: [], hasMore: false}},
			}),
		);
		await page.route('https://bugs.remotion.dev/**', (route) =>
			route.fulfill({json: {bugs: []}}),
		);
		// Avoid changing the example project's dependencies. The server integration test
		// covers this request through the real CLI and package-manager boundary.
		let finishUpgrade: () => void = () => undefined;
		const upgradeFinished = new Promise<void>((resolve) => {
			finishUpgrade = resolve;
		});
		let attempts = 0;
		await page.route('**/api/upgrade-remotion', async (route) => {
			expect(route.request().postDataJSON()).toEqual({version: '4.0.521'});
			attempts++;
			if (attempts === 1) {
				await route.fulfill({
					json: {success: false, error: 'Installation failed. Try again.'},
				});
				return;
			}
			await upgradeFinished;
			await route.fulfill({json: {success: true, data: {}}});
		});
		await page.goto(studioUrl);
		const openSettings = async () => {
			await page.keyboard.press('ControlOrMeta+k');
			const switcher = page.getByRole('dialog');
			await switcher.getByRole('textbox').fill('> Settings');
			await switcher.getByText('Settings...', {exact: true}).click();
			await page
				.getByRole('dialog')
				.getByText('Updates', {exact: true})
				.click();
		};
		await openSettings();
		const dialog = page.getByRole('dialog');
		await dialog.getByRole('button', {name: 'Upgrade to 4.0.521'}).click();
		await expect(
			dialog.getByText('Installation failed. Try again.', {exact: true}),
		).toBeVisible();
		await dialog.getByRole('button', {name: 'Upgrade to 4.0.521'}).click();
		await expect(
			dialog.getByText('Upgrading Remotion...', {exact: true}),
		).toBeVisible();
		await page.keyboard.press('Escape');
		await openSettings();
		await expect(
			dialog.getByText('Upgrading Remotion...', {exact: true}),
		).toBeVisible();
		finishUpgrade();
		await expect(
			dialog.getByText('Remotion has been upgraded.', {exact: true}),
		).toBeVisible();
		await dialog
			.getByRole('button', {name: 'Shut down Studio', exact: true})
			.click();
		await expect(
			dialog.getByText(
				'Studio is shutting down. Run your Studio start command again in the terminal to use the new version.',
				{exact: true},
			),
		).toBeVisible();
		await expect.poll(() => logs).toContain('Shutting down Studio...');
		expect(await exited).toBe(0);
		await expect
			.poll(async () => {
				try {
					await fetch(studioUrl);
					return false;
				} catch {
					return true;
				}
			})
			.toBe(true);
		await expect(
			dialog.getByText(
				'Studio is shutting down. Run your Studio start command again in the terminal to use the new version.',
				{exact: true},
			),
		).toBeVisible();
	} finally {
		if (studio.exitCode === null) studio.kill('SIGTERM');
		await exited;
	}
});
