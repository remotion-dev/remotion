export type BrowserExecutable = string | null;

let currentBrowserExecutablePath: BrowserExecutable = null;

export const setBrowserExecutable = (
	newBrowserExecutablePath: BrowserExecutable
) => {
	currentBrowserExecutablePath = newBrowserExecutablePath;
};

export const getBrowserExecutable = () => {
	return currentBrowserExecutablePath;
};
