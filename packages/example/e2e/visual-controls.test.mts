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

	test('should edit rotation, label, nullable subtitle, and optional extra-rotation', async ({
		page,
	}) => {
		test.setTimeout(90_000);
		await openVisualControlsPanel(page);

		const rotationFieldset = page
			.locator('[data-json-path="rotation"]')
			.locator('..');
		await expect(rotationFieldset).toBeVisible({timeout: 10_000});

		const rotationDragger = rotationFieldset.locator(
			'button.__remotion_input_dragger',
		);
		await expect(rotationDragger).toBeVisible({timeout: 5_000});
		await rotationDragger.click();

		const rotationInput = rotationFieldset.locator('input');
		await expect(rotationInput).toBeVisible({timeout: 5_000});

		const newRotation = '42';
		await rotationInput.fill(newRotation);
		await rotationInput.press('Enter');

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

		const labelInput = page.locator('input[name="label"]');
		await expect(labelInput).toBeVisible({timeout: 10_000});

		const newLabel = 'e2e-test-label';
		await labelInput.fill(newLabel);
		await labelInput.blur();

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

		const undefinedToggle = page.locator(
			'input[name="extra-rotation"][type="checkbox"]',
		);
		await expect(undefinedToggle).toBeVisible({timeout: 10_000});
		await undefinedToggle.uncheck();

		const extraRotationFieldset = page
			.locator('[data-json-path="extra-rotation"]')
			.locator('..');
		const extraRotationDragger = extraRotationFieldset.locator(
			'button.__remotion_input_dragger',
		);
		await expect(extraRotationDragger).toBeVisible({timeout: 10_000});
		await extraRotationDragger.click();

		const extraRotationInput =
			extraRotationFieldset.locator('input[type="text"]');
		await expect(extraRotationInput).toBeVisible({timeout: 5_000});

		const newValue = '90';
		await extraRotationInput.fill(newValue);
		await extraRotationInput.press('Enter');

		await expect
			.poll(
				() => {
					const content = fs.readFileSync(visualControlsFile, 'utf-8');
					const match = content.match(/'extra-rotation',\s*(\d+)/);
					return match?.[1] === newValue;
				},
				{
					message: `Expected VisualControls/index.tsx to contain extra-rotation value ${newValue}`,
					timeout: 10_000,
				},
			)
			.toBe(true);

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
