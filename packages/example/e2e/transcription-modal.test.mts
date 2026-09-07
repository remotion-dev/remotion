import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, STUDIO_URL} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

test.describe('transcription modal', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('supports video and audio assets and configures a Caption[] JSON output', async ({
		page,
	}) => {
		await page.addInitScript(() => {
			Object.defineProperty(navigator, 'gpu', {
				configurable: true,
				value: {requestAdapter: () => Promise.resolve({})},
			});
		});
		await page.goto(`${STUDIO_URL}/NewVideo`);
		await expect(page).toHaveURL(/NewVideo/, {timeout: 15_000});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		await page.getByRole('button', {name: 'Assets', exact: true}).click();
		const assetSelector = page.locator('[data-asset-selector]');
		const video = assetSelector.getByTitle('vp8-vorbis.webm', {exact: true});
		const transcribe = page.getByRole('button', {
			name: 'Transcribe',
			exact: true,
		});
		await expect(async () => {
			await video.click();
			await expect(transcribe).toBeVisible({timeout: 1_000});
		}).toPass({timeout: 30_000});

		await transcribe.click();
		const dialog = page.getByRole('dialog');
		const addToQueueButton = dialog.getByRole('button', {
			name: 'Transcribe',
			exact: true,
		});
		await expect(dialog).toContainText('Transcribe vp8-vorbis.webm');
		await expect(
			dialog.getByText('Whisper model', {exact: true}),
		).toBeVisible();
		const model = dialog.getByTitle('Whisper model');
		await expect(model).toContainText('small.en');
		await expect(dialog.getByTitle('Task')).toHaveCount(0);
		await expect(dialog.getByRole('button', {name: /^Download /})).toHaveCount(
			0,
		);
		await expect(addToQueueButton).toBeEnabled();

		await model.click();
		await page.getByRole('button', {name: /^tiny ·/}).click();
		await expect(model).toContainText('tiny ·');
		const task = dialog.getByRole('button', {
			name: 'Task: Transcribe',
			exact: true,
		});
		await task.click();
		await page
			.getByRole('button', {name: 'Task: Translate to English', exact: true})
			.click();
		await expect(
			dialog.getByRole('button', {
				name: 'Task: Translate to English',
				exact: true,
			}),
		).toContainText('Translate to English');
		await expect(
			dialog.getByText(
				'Word timings may be less accurate when translating to English.',
				{exact: true},
			),
		).toBeVisible();
		await expect(addToQueueButton).toBeEnabled();

		const chunkLength = dialog.getByRole('button', {
			name: /^Chunk length:/,
		});
		const strideLength = dialog.getByRole('button', {
			name: /^Stride length:/,
		});
		await expect(chunkLength).toHaveText('30s');
		await expect(strideLength).toHaveText('5s');

		const forceFullSequences = dialog.getByRole('checkbox', {
			name: 'Force full sequences',
		});
		const useSampling = dialog.getByRole('checkbox', {
			name: 'Use sampling',
		});
		const repetitionPenalty = dialog.getByRole('button', {
			name: /^Repetition penalty:/,
		});
		const noRepeatNgramSize = dialog.getByRole('button', {
			name: /^No-repeat n-gram size:/,
		});
		await expect(forceFullSequences).not.toBeChecked();
		await expect(useSampling).not.toBeChecked();
		await expect(
			dialog.getByRole('button', {name: /^Temperature:/}),
		).toHaveCount(0);
		await expect(dialog.getByRole('button', {name: /^Top K:/})).toHaveCount(0);
		await expect(repetitionPenalty).toHaveText('1');
		await expect(noRepeatNgramSize).toHaveText('0');

		await forceFullSequences.check();
		await useSampling.check();
		const temperature = dialog.getByRole('button', {
			name: /^Temperature:/,
		});
		const topK = dialog.getByRole('button', {name: /^Top K:/});
		await expect(temperature).toHaveText('1');
		await expect(topK).toHaveText('50');

		await topK.click();
		const topKInput = dialog.getByRole('textbox', {name: /^Top K:/});
		await topKInput.fill('1.5');
		await expect(dialog).toContainText('Top K must be a non-negative integer');
		await expect(addToQueueButton).toBeDisabled();
		await topKInput.fill('25');
		await topKInput.press('Enter');
		await expect(topK).toHaveText('25');
		await expect(addToQueueButton).toBeEnabled();

		for (const [setting, inputName, value] of [
			[temperature, /^Temperature:/, '0.7'],
			[repetitionPenalty, /^Repetition penalty:/, '1.2'],
			[noRepeatNgramSize, /^No-repeat n-gram size:/, '3'],
		] as const) {
			await setting.click();
			const input = dialog.getByRole('textbox', {
				name: inputName,
			});
			await input.fill(value);
			await input.press('Enter');
			await expect(setting).toHaveText(value);
		}

		await chunkLength.click();
		const chunkLengthInput = dialog.getByRole('textbox', {
			name: /^Chunk length:/,
		});
		await chunkLengthInput.fill('10');
		await chunkLengthInput.press('Enter');
		await expect(dialog).toContainText(
			'Stride length must be less than half of chunk length',
		);
		await expect(addToQueueButton).toBeDisabled();

		await strideLength.click();
		const strideLengthInput = dialog.getByRole('textbox', {
			name: /^Stride length:/,
		});
		await strideLengthInput.fill('4');
		await strideLengthInput.press('Enter');
		await expect(addToQueueButton).toBeEnabled();

		await expect(
			dialog.getByText('Output in public/', {exact: true}),
		).toBeVisible();

		const output = dialog.getByRole('textbox', {
			name: 'Caption output file',
		});
		await expect(output).toHaveValue('vp8-vorbis-captions.json');
		await output.fill('captions/new-video.json');
		await expect(output).toHaveValue('captions/new-video.json');

		await page.keyboard.press('Escape');
		await expect(dialog).toBeHidden();
		await assetSelector.getByTitle('sine.wav', {exact: true}).click();
		await expect(transcribe).toBeVisible();
		await transcribe.click();
		await expect(dialog).toContainText('Transcribe sine.wav');
		await page.keyboard.press('Escape');
	});
});
