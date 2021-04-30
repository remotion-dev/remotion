import {RenderInternals} from '@remotion/renderer';
import {executablePath} from './get-chromium-executable-path';

type Await<T> = T extends PromiseLike<infer U> ? U : T;

let _browserInstance: Await<
	ReturnType<typeof RenderInternals.openBrowser>
> | null;

// TODO Potential race condition
export const getBrowserInstance = async () => {
	if (_browserInstance) {
		return _browserInstance;
	}
	const execPath = await executablePath();
	_browserInstance = await RenderInternals.openBrowser('chrome', {
		customExecutable: execPath,
	});
	return _browserInstance;
};
