import {RenderInternals} from '@remotion/renderer';
import {executablePath} from './get-chromium-executable-path';

type Await<T> = T extends PromiseLike<infer U> ? U : T;

let _browserInstance: Await<
	ReturnType<typeof RenderInternals.openBrowser>
> | null;

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

export const getBrowserInstance = async (): Promise<
	ReturnType<typeof RenderInternals.openBrowser>
> => {
	if (launching) {
		await waitForLaunched();
	}

	if (_browserInstance) {
		return _browserInstance;
	}

	launching = true;

	const execPath = await executablePath();
	_browserInstance = await RenderInternals.openBrowser('chrome', {
		customExecutable: execPath,
	});
	launching = false;
	return _browserInstance;
};
