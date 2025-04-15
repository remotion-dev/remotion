import {test} from '@playwright/test';
import {execSync} from 'node:child_process';
import {chromium} from 'playwright';

const runTest = async (entrypoint: string) => {
	const bundled = execSync(`bun build ${entrypoint}`);

	const browser = await chromium.launch({headless: true}); // Set headless: true to run in headless mode
	const page = await browser.newPage();

	await page.goto('about:blank');

	await page.evaluate(bundled.toString('utf8'));

	await browser.close();
};

test('should downsample audio data', async () => {
	await runTest(__dirname + '/downsample-audiodata.ts');
});

test('should upsample audio data', async () => {
	await runTest(__dirname + '/upsample-audiodata.ts');
});
