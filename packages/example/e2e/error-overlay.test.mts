import {expect, test} from '@playwright/test';
import fs from 'fs';
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
 * applies the fix — and removing it again should bring the error back.
 *
 * Before the fix, the error UI never dismissed without a full page reload:
 * `CompositionErrorBoundary` set `hasError: true` on catch, returned `null`
 * forever, and never reset that flag, so the boundary's children were never
 * re-rendered after the fix arrived.
 */
test.describe('error overlay dismissal', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('error UI toggles with the underlying runtime error across HMR cycles', async ({
		page,
	}) => {
		const originalContent = fs.readFileSync(errorOverlayE2eFile, 'utf-8');
		expect(originalContent).toContain('blur({radius: 24})');
		// Make sure the marker only appears once so the swap is unambiguous.
		expect(originalContent.split('blur({radius: 24})')).toHaveLength(2);

		const buggyContent = originalContent.replace(
			'blur({radius: 24})',
			'blur({})',
		);
		expect(buggyContent).not.toBe(originalContent);

		const errorMessage = page.getByText('"radius" must be a finite number');

		const writeAndWaitForRebuild = async (
			content: string,
			label: string,
		): Promise<void> => {
			const logCountBefore = readStudioLogs().length;
			fs.writeFileSync(errorOverlayE2eFile, content);
			await expect
				.poll(
					() => {
						const newLogs = readStudioLogs()
							.slice(logCountBefore)
							.map(stripAnsi);
						return newLogs.some((log) => log.includes('Built in'));
					},
					{
						message: `Expected webpack to rebuild after ${label}`,
						timeout: 30_000,
					},
				)
				.toBe(true);
		};

		await page.goto(`${STUDIO_URL}/error-overlay-e2e`);
		await expect(page).toHaveURL(/error-overlay-e2e/, {timeout: 15_000});

		// Sanity check: no error visible initially.
		await expect(errorMessage).toHaveCount(0);

		// 1. Introduce the bug: remove the `radius: 24` argument.
		await writeAndWaitForRebuild(buggyContent, 'introducing the bug');
		await expect(errorMessage).toBeVisible({timeout: 15_000});

		// 2. Fix the bug: restore the `radius: 24` argument. The error UI should
		//    dismiss once HMR applies the fix.
		await writeAndWaitForRebuild(originalContent, 'fixing the bug');
		await expect(errorMessage).toHaveCount(0, {timeout: 15_000});

		// 3. Re-introduce the bug: the error UI should come back. This guards
		//    against the boundary getting permanently stuck in the success state
		//    after the first reset.
		await writeAndWaitForRebuild(buggyContent, 're-introducing the bug');
		await expect(errorMessage).toBeVisible({timeout: 15_000});

		await writeAndWaitForRebuild(originalContent, 'restoring after the test');
		await expect(errorMessage).toHaveCount(0, {timeout: 15_000});
	});
});
