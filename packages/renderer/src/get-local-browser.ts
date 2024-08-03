import fs from 'fs';
import {homedir} from 'node:os';
import {NoReactInternals} from 'remotion/no-react';

const getSearchPathsForProduct = () => {
	if (NoReactInternals.ENABLE_V5_BREAKING_CHANGES) {
		return [];
	}

	return [
		process.env.PUPPETEER_EXECUTABLE_PATH ?? null,
		process.platform === 'darwin'
			? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
			: null,
		process.platform === 'linux' ? '/usr/bin/google-chrome' : null,
		process.platform === 'linux' ? '/usr/bin/chromium-browser' : null,
		process.platform === 'linux' ? '/usr/bin/chromium' : null, // Debian
		process.platform === 'linux'
			? '/app/.apt/usr/bin/google-chrome-stable'
			: null,
		process.platform === 'win32'
			? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
			: null,
		process.platform === 'win32'
			? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
			: null,
		process.platform === 'win32'
			? homedir() + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
			: null,
		process.platform === 'win32'
			? 'C:\\Program Files\\Google\\Chrome SxS\\Application\\chrome.exe'
			: null,
		process.platform === 'win32'
			? 'C:\\Program Files (x86)\\Google\\Chrome SxS\\Application\\chrome.exe'
			: null,
		process.platform === 'win32'
			? homedir() +
				'\\AppData\\Local\\Google\\Chrome SxS\\Application\\chrome.exe'
			: null,
	].filter(Boolean) as string[];
};

export const getLocalBrowser = () => {
	for (const p of getSearchPathsForProduct()) {
		if (fs.existsSync(p)) {
			return p;
		}
	}

	return null;
};
