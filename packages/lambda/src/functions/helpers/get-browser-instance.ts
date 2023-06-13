import type {ChromiumOptions, openBrowser} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {Await} from '../../shared/await';
import {executablePath} from './get-chromium-executable-path';

let _browserInstance: Await<ReturnType<typeof openBrowser>> | null;

let launching = false;

const waitForLaunched = () => {
	return new Promise<void>((resolve, reject) => {
		const check = () =>
			setTimeout(() => {
				if (launching) {
					resolve();
				} else {
					check();
				}
			}, 16);

		setTimeout(() => reject(new Error('Timeout launching browser')), 5000);
		check();
	});
};

export const getBrowserInstance = async (
	shouldDumpIo: boolean,
	chromiumOptions: ChromiumOptions
): ReturnType<typeof openBrowser> => {
	if (launching) {
		await waitForLaunched();
		if (!_browserInstance) {
			throw new Error('expected to launch');
		}

		return _browserInstance;
	}

	if (_browserInstance) {
		return _browserInstance;
	}

	launching = true;

	const execPath = executablePath();

	const actualChromiumOptions: ChromiumOptions = {
		...chromiumOptions,
		// Override the `null` value, which might come from CLI with swANGLE
		gl: chromiumOptions.gl ?? 'swangle',
	};

	_browserInstance = await RenderInternals.internalOpenBrowser({
		browser: 'chrome',
		browserExecutable: execPath,
		shouldDumpIo,
		chromiumOptions: actualChromiumOptions,
		forceDeviceScaleFactor: undefined,
		indent: false,
		viewport: null,
	});
	_browserInstance.on('disconnected', () => {
		console.log('Browser disconnected / crashed');
		_browserInstance?.close(true).catch(() => undefined);
		_browserInstance = null;
	});
	launching = false;
	return _browserInstance;
};
