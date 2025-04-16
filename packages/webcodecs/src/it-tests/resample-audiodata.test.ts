import type {Page} from '@playwright/test';
import {test} from '@playwright/test';
import {execSync} from 'node:child_process';

const runTest = async (entrypoint: string, page: Page) => {
	const bundled = execSync(`bun build ${entrypoint}`);

	await page.goto('about:blank');
	await page.evaluate(bundled.toString('utf8'));
};

test('should downsample audio data', async ({page}) => {
	await runTest(__dirname + '/downsample-audiodata.ts', page);
});

test('should upsample audio data', async ({page}) => {
	await runTest(__dirname + '/upsample-audiodata.ts', page);
});

test('should resample audio data with uneven sample count', async ({page}) => {
	await runTest(__dirname + '/uneven-audio-sample.ts', page);
});

test('should resample audio data with interleaved format', async ({page}) => {
	await runTest(__dirname + '/interleaved-downsample.ts', page);
});

test('should resample audio data with format conversion', async ({page}) => {
	await runTest(__dirname + '/format-conversion.ts', page);
});

test('should handle edge cases', async ({page}) => {
	await runTest(__dirname + '/edge-cases.ts', page);
});
