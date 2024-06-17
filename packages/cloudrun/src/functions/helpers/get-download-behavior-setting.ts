import type {DownloadBehavior} from './payloads';

const problematicCharacters = {
	'%3A': ':',
	'%2F': '/',
	'%3F': '?',
	'%23': '#',
	'%5B': '[',
	'%5D': ']',
	'%40': '@',
	'%21': '!',
	'%24': '$',
	'%26': '&',
	'%27': "'",
	'%28': '(',
	'%29': ')',
	'%2A': '*',
	'%2B': '+',
	'%2C': ',',
	'%3B': ';',
};

type HexInfo = {
	containsHex: boolean;
};

const includesHexOfUnsafeChar = (path: string): HexInfo => {
	for (const key of Object.keys(
		problematicCharacters,
	) as (keyof typeof problematicCharacters)[]) {
		if (path.includes(key)) {
			return {containsHex: true};
		}
	}

	return {containsHex: false};
};

export const getDownloadBehaviorSetting = (
	downloadBehavior: DownloadBehavior,
): Record<string, string> => {
	if (downloadBehavior.type === 'play-in-browser') {
		return {};
	}

	if (downloadBehavior.fileName === null) {
		return {contentDisposition: `attachment`};
	}

	const {containsHex} = includesHexOfUnsafeChar(downloadBehavior.fileName);
	if (containsHex) {
		return {
			contentDisposition: `attachment; filename="${downloadBehavior.fileName}"`,
		};
	}

	return {
		contentDisposition: `attachment; filename="${encodeURIComponent(downloadBehavior.fileName)}"`,
	};
};
