import type {DownloadBehavior} from '@remotion/serverless-client';

// By setting the Content-Disposition header in an S3 object,
// you can control if the user downloads the item if you
// visit the link

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

export const getContentDispositionHeader = (
	behavior: DownloadBehavior | null,
): string | undefined => {
	if (behavior === null) {
		return undefined;
	}

	if (behavior.type === 'play-in-browser') {
		return undefined;
	}

	if (behavior.fileName === null) {
		return `attachment`;
	}

	const {containsHex} = includesHexOfUnsafeChar(behavior.fileName);
	if (containsHex) {
		return `attachment; filename="${behavior.fileName}"`;
	}

	return `attachment; filename="${encodeURIComponent(behavior.fileName)}"`;
};
