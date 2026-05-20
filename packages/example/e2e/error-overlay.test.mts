import fs from 'fs';
import {expect, test} from '@playwright/test';
import {errorOverlayE2eFile, STUDIO_URL} from './constants.mts';
import {readStudioLogs, stripAnsi} from './helpers.mts';
import {startStudio, stopStudio} from './studio-server.mts';

/**
 * Regression test for https://github.com/remotion-dev/remotion/issues/7447
 *
 * Removing the `radius: 24` argument from `blur({radius: 24})` causes the
 * `<Solid>` component to throw a `TypeError` during render. The studio's
 * `CompositionErrorBoundary` catches it and shows the error UI inside the
 * canvas area. Adding the argument back should dismiss the error once HMR
 * applies the fix.
 *
 * The bug is that the error UI does not dismiss until the page is reloaded:
 * `CompositionErrorBoundary` sets `hasError: true` on catch, returns `null`
 * forever, and never resets that flag, so the boundary's children are never
 * re-rendered after the fix arrives.
 */
test.describe('error overlay dismissal', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('error UI dismisses after the underlying runtime error is fixed', async ({
		page,
	}) => {
		const originalContent = fs.readFileSync(errorOverlayE2eFile, 'utf-8');
		expect(originalContent).toContain('blur({radius: 24})');
		// Make sure the marker only appears once so the swap is unambiguous.
		expect(originalContent.split('blur({radius: 24})')).toHaveLength(2);

		await page.goto(`${STUDIO_URL}/error-overlay-e2e`);
		await expect(page).toHaveURL(/error-overlay-e2e/, {timeout: 15_000});

		// Sanity check: no error visible initially.
		await expect(
			page.getByText('"radius" must be a finite number'),
		).toHaveCount(0);

		// 1. Introduce the bug: remove the `radius: 24` argument.
		const buggyContent = originalContent.replace(
			'blur({radius: 24})',
			'blur({})',
		);
		expect(buggyContent).not.toBe(originalContent);

		const logCountBeforeBug = readStudioLogs().length;
		fs.writeFileSync(errorOverlayE2eFile, buggyContent);

		// Webpack rebuilds successfully — the bug is a runtime error, not a build error.
		await expect
			.poll(
				() => {
					const newLogs = readStudioLogs()
						.slice(logCountBeforeBug)
						.map(stripAnsi);
					return newLogs.some((log) => log.includes('Built in'));
				},
				{
					message: 'Expected webpack to rebuild after introducing the bug',
					timeout: 30_000,
				},
			)
			.toBe(true);

		// Error should appear with the radius validation message.
		await expect(
			page.getByText('"radius" must be a finite number'),
		).toBeVisible({timeout: 15_000});

		// 2. Fix the bug: restore the `radius: 24` argument.
		const logCountBeforeFix = readStudioLogs().length;
		fs.writeFileSync(errorOverlayE2eFile, originalContent);

		await expect
			.poll(
				() => {
					const newLogs = readStudioLogs()
						.slice(logCountBeforeFix)
						.map(stripAnsi);
					return newLogs.some((log) => log.includes('Built in'));
				},
				{
					message: 'Expected webpack to rebuild after fixing the bug',
					timeout: 30_000,
				},
			)
			.toBe(true);

		// 3. The error UI should dismiss once HMR applies the fix. This is the
		//    assertion that currently fails — it stays on screen forever.
		await expect(
			page.getByText('"radius" must be a finite number'),
		).toHaveCount(0, {timeout: 15_000});
	});
});
