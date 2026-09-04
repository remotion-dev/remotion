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
			name: 'Import',
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
				JSON.stringify([
					{
						text: 'Broken',
						endMs: 1000,
						timestampMs: 500,
						confidence: null,
					},
				]),
			),
		});
		await expect(
			page.getByText(
				/broken\.json:.*captions\[0\]\.startMs must be a finite, non-negative number/,
			),
		).toBeVisible();
		expect(fs.readFileSync(elementCaptionsFile, 'utf-8')).toBe(
			sourceBeforeFailedImport,
		);

		await importCaptionsInput.setInputFiles({
			name: 'captions.json',
			mimeType: 'application/json',
			buffer: Buffer.from(
				JSON.stringify([
					{
						text: 'Imported',
						startMs: 100,
						endMs: 400,
						timestampMs: 250,
						confidence: null,
					},
					{
						text: ' captions',
						startMs: 400,
						endMs: 900,
						timestampMs: 650,
						confidence: null,
					},
				]),
			),
		});
		await expect(defaultCaption).toHaveValue('Imported');
		await expect
			.poll(() => fs.readFileSync(elementCaptionsFile, 'utf-8'))
			.toMatch(/text:\s*['"]Imported['"][\s\S]*startMs:\s*100/);
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
