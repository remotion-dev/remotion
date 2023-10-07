import type {BrowserExecutable} from '@remotion/renderer';

let currentBrowserExecutablePath: BrowserExecutable = null;

export const setBrowserExecutable = (
	newBrowserExecutablePath: BrowserExecutable,
) => {
	currentBrowserExecutablePath = newBrowserExecutablePath;
};

export const getBrowserExecutable = () => {
	return currentBrowserExecutablePath;
};
