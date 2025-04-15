import {$} from 'bun';
import {beforeAll, test} from 'bun:test';
import {chromium} from 'playwright';

beforeAll(async () => {
	await $`bunx playwright install`;
});

test('sample', async () => {
	const bundled = await Bun.build({
		entrypoints: [__dirname + '/audiodata-resample.ts'],
	});

	console.log(bundled);

	const browser = await chromium.launch({headless: true}); // Set headless: true to run in headless mode
	const page = await browser.newPage();
	await page.goto('about:blank');

	const result = await page.evaluate(await bundled.outputs[0].text());

	console.log('Result from browser:', result);
	await browser.close();
});
