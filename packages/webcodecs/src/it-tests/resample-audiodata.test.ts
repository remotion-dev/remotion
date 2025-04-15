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
