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
const defaultCaptionsFile = path.join(
	exampleDir,
	'src',
	'MovingPillCaptionsComposition.tsx',
);

test.describe('captions inspector', () => {
	let inlineSourceBefore: string;
	let defaultSourceBefore: string;

	test.beforeEach(async () => {
		inlineSourceBefore = fs.readFileSync(inlineCaptionsFile, 'utf-8');
		defaultSourceBefore = fs.readFileSync(defaultCaptionsFile, 'utf-8');
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
		fs.writeFileSync(inlineCaptionsFile, inlineSourceBefore);
		fs.writeFileSync(defaultCaptionsFile, defaultSourceBefore);
	});

	test('persists inline and default caption edits', async ({page}) => {
		await page.goto(`${STUDIO_URL}/captions-inspector-e2e`);
		await expect(page).toHaveURL(/captions-inspector-e2e/, {timeout: 15_000});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		const captionsSequence = page
			.getByText('<AnimatedCaptions>', {exact: true})
			.first();
		const pageBreakAfterFirstCaption = page.getByRole('button', {
			name: 'Add page break after caption 1',
			exact: true,
		});
		await expect(async () => {
			await captionsSequence.click();
			await expect(pageBreakAfterFirstCaption).toBeVisible({timeout: 1_000});
		}).toPass({timeout: 30_000});
		await expect(pageBreakAfterFirstCaption).toHaveAttribute(
			'aria-pressed',
			'false',
		);

		await pageBreakAfterFirstCaption.click();
		await expect(
			page.getByRole('button', {
				name: 'Remove page break after caption 1',
				exact: true,
			}),
		).toHaveAttribute('aria-pressed', 'true');
		await expect
			.poll(() => {
				return fs
					.readFileSync(inlineCaptionsFile, 'utf-8')
					.includes('pageBreakAfter: true');
			})
			.toBe(true);

		await page.goto(`${STUDIO_URL}/default-captions-inspector-e2e`);
		await expect(page).toHaveURL(/default-captions-inspector-e2e/, {
			timeout: 15_000,
		});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		const defaultCaptionsSequence = page
			.getByTitle('Moving Pill Captions', {exact: true})
			.first();
		const defaultCaption = page.getByRole('textbox', {name: 'Caption 1'});
		await expect(async () => {
			await defaultCaptionsSequence.click();
			await expect(defaultCaption).toBeVisible({timeout: 1_000});
		}).toPass({timeout: 30_000});
		await expect(defaultCaption).toBeEnabled();

		await defaultCaption.fill('Editable captions');
		await defaultCaption.blur();
		await expect
			.poll(() => {
				return /text:\s*['"]Editable captions['"]/.test(
					fs.readFileSync(defaultCaptionsFile, 'utf-8'),
				);
			})
			.toBe(true);
	});
});
