import type {ChromiumOptions} from '@remotion/renderer';
import {openBrowser} from '@remotion/renderer';
import {executablePath} from './get-chromium-executable-path';

export const getBrowserInstance = async (
	chromiumOptions: ChromiumOptions,
): ReturnType<typeof openBrowser> => {
	const execPath = executablePath();

	const actualChromiumOptions: ChromiumOptions = {
		...chromiumOptions,
		// Override the `null` value, which might come from CLI with swANGLE
		gl: chromiumOptions.gl ?? 'swangle',
	};

	const _browserInstance = await openBrowser('chrome', {
		browserExecutable: execPath,
		chromiumOptions: actualChromiumOptions,
		forceDeviceScaleFactor: undefined,
	});

	return _browserInstance;
};
