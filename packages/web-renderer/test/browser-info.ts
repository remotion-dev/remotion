import {cpus, totalmem} from 'node:os';
import {chromium} from 'playwright';

const browser = await chromium.launch({channel: 'chrome', headless: true});
try {
	const session = await browser.newBrowserCDPSession();
	const {gpu} = await session.send('SystemInfo.getInfo');
	// eslint-disable-next-line no-console
	console.log('Browser test environment', {
		chrome: browser.version(),
		cpu: cpus()[0].model,
		cores: cpus().length,
		memoryGiB: totalmem() / 1024 ** 3,
		renderer: gpu.auxAttributes?.glRenderer,
		skiaBackend: gpu.auxAttributes?.skiaBackendType,
		features: gpu.featureStatus,
	});
} finally {
	await browser.close();
}
