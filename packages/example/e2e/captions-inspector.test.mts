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
const elementCaptionsFile = path.join(
	exampleDir,
	'src',
	'moving-pill-captions.element.tsx',
);
const elementCallSiteFile = path.join(
	exampleDir,
	'src',
	'MovingPillCaptionsComposition.tsx',
);

test.describe('captions inspector', () => {
	let inlineSourceBefore: string;
	let elementSourceBefore: string;
	let elementCallSiteSourceBefore: string;

	test.beforeEach(async () => {
		inlineSourceBefore = fs.readFileSync(inlineCaptionsFile, 'utf-8');
		elementSourceBefore = fs.readFileSync(elementCaptionsFile, 'utf-8');
		elementCallSiteSourceBefore = fs.readFileSync(elementCallSiteFile, 'utf-8');
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
		fs.writeFileSync(inlineCaptionsFile, inlineSourceBefore);
		fs.writeFileSync(elementCaptionsFile, elementSourceBefore);
		fs.writeFileSync(elementCallSiteFile, elementCallSiteSourceBefore);
	});

	test('persists caption edits at their inline definitions', async ({page}) => {
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

		const importCaptionsButton = page.getByRole('button', {
			name: 'Import captions',
			exact: true,
		});
		const importCaptionsInput = page.getByLabel('Import captions file');
		await expect(importCaptionsButton).toBeVisible();

		const sourceBeforeFailedImport = fs.readFileSync(
			elementCaptionsFile,
			'utf-8',
		);
		await importCaptionsInput.setInputFiles({
			name: 'broken.json',
			mimeType: 'application/json',
			buffer: Buffer.from(
				JSON.stringify({
					language_code: 'eng',
					segments: [
						{
							text: 'Broken',
							start_time: 0,
							end_time: 1,
							words: [{text: 'Broken', end_time: 1}],
						},
					],
				}),
			),
		});
		await expect(
			page.getByText(
				/broken\.json:.*segments\[0\]\.words\[0\]\.start_time must be a finite number/,
			),
		).toBeVisible();
		expect(fs.readFileSync(elementCaptionsFile, 'utf-8')).toBe(
			sourceBeforeFailedImport,
		);

		await importCaptionsInput.setInputFiles({
			name: 'captions.json',
			mimeType: 'application/json',
			buffer: Buffer.from(
				JSON.stringify({
					language_code: 'eng',
					segments: [
						{
							text: 'Imported captions',
							start_time: 0.1,
							end_time: 0.9,
							words: [
								{text: 'Imported', start_time: 0.1, end_time: 0.4},
								{text: ' ', start_time: 0.4, end_time: 0.5},
								{text: 'captions', start_time: 0.5, end_time: 0.9},
							],
						},
					],
				}),
			),
		});
		await expect(
			page.getByText('Replace captions?', {exact: true}),
		).toBeVisible();
		expect(fs.readFileSync(elementCaptionsFile, 'utf-8')).toBe(
			sourceBeforeFailedImport,
		);
		await page.getByRole('button', {name: 'Replace captions'}).click();
		await expect(
			page.getByText(
				'Imported 2 captions from ElevenLabs segmented JSON. Undo is available.',
			),
		).toBeVisible();
		await expect(defaultCaption).toHaveValue('Imported');
		await expect
			.poll(() => fs.readFileSync(elementCaptionsFile, 'utf-8'))
			.toMatch(/startMs:\s*100[\s\S]*text:\s*['"]Imported['"]/);
		expect(fs.readFileSync(elementCallSiteFile, 'utf-8')).toBe(
			elementCallSiteSourceBefore,
		);

		await defaultCaption.fill('Edited imported caption');
		await defaultCaption.blur();
		await expect
			.poll(() => {
				return /text:\s*['"]Edited imported caption['"]/.test(
					fs.readFileSync(elementCaptionsFile, 'utf-8'),
				);
			})
			.toBe(true);
	});
});
