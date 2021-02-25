export type ChromiumExecutable = string | null;

let currentChromiumExecutablePath: ChromiumExecutable = null;

export const setChromiumExecutable = (
	newChromiumExecutablePath: ChromiumExecutable
) => {
	currentChromiumExecutablePath = newChromiumExecutablePath;
};

export const getChromiumExecutable = () => {
	return currentChromiumExecutablePath;
};
