import fs from 'fs';
import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, visualControlsFile} from './constants.mts';
import {openVisualControlsPanel} from './helpers.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

test.describe('visual controls', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('should edit rotation and update source file', async ({page}) => {
		await openVisualControlsPanel(page);

		// Find the rotation control's fieldset via the data-json-path label
		const rotationFieldset = page
			.locator('[data-json-path="rotation"]')
			.locator('..');
		await expect(rotationFieldset).toBeVisible({timeout: 10_000});

		// Click the dragger button to activate the number input
		const dragger = rotationFieldset.locator('button.__remotion_input_dragger');
		await expect(dragger).toBeVisible({timeout: 5_000});
		await dragger.click();

		// Fill the now-visible input with a new value
		const input = rotationFieldset.locator('input');
		await expect(input).toBeVisible({timeout: 5_000});

		const newRotation = '42';
		await input.fill(newRotation);
		await input.press('Enter');

		// Wait for the source file to be updated on disk
		await expect
			.poll(
				() => {
					const content = fs.readFileSync(visualControlsFile, 'utf-8');
					return content.includes(`'rotation', ${newRotation}`);
				},
				{
					message: `Expected VisualControls/index.tsx to contain rotation value ${newRotation}`,
					timeout: 10_000,
				},
			)
			.toBe(true);
	});

	test('should edit label string and update source file', async ({page}) => {
		await openVisualControlsPanel(page);

		// Find the label string input by its name attribute
		const labelInput = page.locator('input[name="label"]');
		await expect(labelInput).toBeVisible({timeout: 10_000});

		const newLabel = 'e2e-test-label';
		await labelInput.fill(newLabel);
		await labelInput.blur();

		// Wait for the source file to be updated on disk
		await expect
			.poll(
				() => {
					const content = fs.readFileSync(visualControlsFile, 'utf-8');
					return content.includes(newLabel);
				},
				{
					message: `Expected VisualControls/index.tsx to contain label "${newLabel}"`,
					timeout: 10_000,
				},
			)
			.toBe(true);
	});

	test('should edit nullable subtitle and update source file', async ({
		page,
	}) => {
		await openVisualControlsPanel(page);

		// Edit the subtitle text (nullable string, default 'A subtitle')
		const subtitleInput = page.locator(
			'input[name="subtitle"]:not([type="checkbox"])',
		);
		await expect(subtitleInput).toBeVisible({timeout: 10_000});

		const newSubtitle = 'e2e-nullable-test';
		await subtitleInput.fill(newSubtitle);
		await subtitleInput.blur();

		await expect
			.poll(
				() => {
					const content = fs.readFileSync(visualControlsFile, 'utf-8');
					return content.includes(newSubtitle);
				},
				{
					message: `Expected VisualControls/index.tsx to contain subtitle "${newSubtitle}"`,
					timeout: 10_000,
				},
			)
			.toBe(true);

		// Now toggle to null via the checkbox
		const nullCheckbox = page.locator(
			'input[name="subtitle"][type="checkbox"]',
		);
		await expect(nullCheckbox).toBeVisible({timeout: 5_000});
		await nullCheckbox.check();

		await expect
			.poll(
				() => {
					const content = fs.readFileSync(visualControlsFile, 'utf-8');
					return content.includes("'subtitle', null");
				},
				{
					message:
						'Expected VisualControls/index.tsx to contain subtitle set to null',
					timeout: 10_000,
				},
			)
			.toBe(true);
	});

	test('should edit optional extra-rotation and update source file', async ({
		page,
	}) => {
		await openVisualControlsPanel(page);

		// The extra-rotation control defaults to undefined.
		// First, enable it by unchecking the "undefined" checkbox.
		const undefinedToggle = page.locator(
			'input[name="extra-rotation"][type="checkbox"]',
		);
		await expect(undefinedToggle).toBeVisible({timeout: 10_000});
		await undefinedToggle.uncheck();

		// Now find the dragger and interact with it
		const fieldset = page
			.locator('[data-json-path="extra-rotation"]')
			.locator('..');
		const dragger = fieldset.locator('button.__remotion_input_dragger');
		await expect(dragger).toBeVisible({timeout: 10_000});
		await dragger.click();

		const input = fieldset.locator('input[type="number"]');
		await expect(input).toBeVisible({timeout: 5_000});

		const newValue = '90';
		await input.fill(newValue);
		await input.press('Enter');

		await expect
			.poll(
				() => {
					const content = fs.readFileSync(visualControlsFile, 'utf-8');
					// The codemod may format the value on the next line
					const match = content.match(/'extra-rotation',\s*(\d+)/);
					return match?.[1] === newValue;
				},
				{
					message: `Expected VisualControls/index.tsx to contain extra-rotation value ${newValue}`,
					timeout: 10_000,
				},
			)
			.toBe(true);

		// Now toggle back to undefined via the checkbox
		await expect(undefinedToggle).toBeVisible({timeout: 5_000});
		await undefinedToggle.check();

		await expect
			.poll(
				() => {
					const content = fs.readFileSync(visualControlsFile, 'utf-8');
					return /'extra-rotation',\s*undefined/.test(content);
				},
				{
					message:
						'Expected VisualControls/index.tsx to contain extra-rotation set to undefined',
					timeout: 10_000,
				},
			)
			.toBe(true);
	});
});
