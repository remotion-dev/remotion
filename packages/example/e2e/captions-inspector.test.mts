import fs from 'fs';
import path from 'path';
import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, STUDIO_URL, exampleDir} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

const inlineCaptionsFile = path.join(
	exampleDir,
	'src',
	'CaptionsTester',
	'InlineAnimatedCaptions.tsx',
);

test.describe('captions inspector', () => {
	let sourceBefore: string;

	test.beforeEach(async () => {
		sourceBefore = fs.readFileSync(inlineCaptionsFile, 'utf-8');
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
		fs.writeFileSync(inlineCaptionsFile, sourceBefore);
	});

	test('persists a forced line break to an inline caption', async ({page}) => {
		await page.goto(`${STUDIO_URL}/captions-inspector-e2e`);
		await expect(page).toHaveURL(/captions-inspector-e2e/, {timeout: 15_000});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		const captionsSequence = page
			.getByText('<AnimatedCaptions>', {exact: true})
			.first();
		const lineBreakAfterFirstCaption = page.getByRole('button', {
			name: 'Add line break after caption 1',
			exact: true,
		});
		await expect(async () => {
			await captionsSequence.click();
			await expect(lineBreakAfterFirstCaption).toBeVisible({timeout: 1_000});
		}).toPass({timeout: 30_000});
		await expect(lineBreakAfterFirstCaption).toHaveAttribute(
			'aria-pressed',
			'false',
		);

		await lineBreakAfterFirstCaption.click();
		await expect(
			page.getByRole('button', {
				name: 'Remove line break after caption 1',
				exact: true,
			}),
		).toHaveAttribute('aria-pressed', 'true');
		await expect
			.poll(() => {
				return fs
					.readFileSync(inlineCaptionsFile, 'utf-8')
					.includes('lineBreakAfter: true');
			})
			.toBe(true);
	});
});
