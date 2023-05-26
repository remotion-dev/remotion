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

type HexCode = keyof typeof problematicCharacters;

export type HexInfo =
	| {
			containsHex: false;
	  }
	| {
			containsHex: true;
			hexCode: HexCode;
	  };

const didWarn: {[key: string]: boolean} = {};
const warnOnce = (message: string) => {
	if (didWarn[message]) {
		return;
	}

	console.warn(message);
	didWarn[message] = true;
};

export const includesHexOfUnsafeChar = (path: string): HexInfo => {
	for (const key of Object.keys(
		problematicCharacters
	) as (keyof typeof problematicCharacters)[]) {
		if (path.includes(key)) {
			return {containsHex: true, hexCode: key as HexCode};
		}
	}

	return {containsHex: false};
};

const trimLeadingSlash = (path: string): string => {
	if (path.startsWith('/')) {
		return trimLeadingSlash(path.substring(1));
	}

	return path;
};

const inner = (path: string): string => {
	if (typeof window !== 'undefined' && window.remotion_staticBase) {
		return `${window.remotion_staticBase}/${trimLeadingSlash(path)}`;
	}

	return `/${trimLeadingSlash(path)}`;
};

/**
 * @description Reference a file from the public/ folder. If the file does not appear in the autocomplete, type the path manually.
 * @see [Documentation](https://www.remotion.dev/docs/staticfile)
 */
export const staticFile = (path: string) => {
	if (path.startsWith('http://') || path.startsWith('https://')) {
		throw new TypeError(
			`staticFile() does not support remote URLs - got "${path}". Instead, pass the URL without wrapping it in staticFile(). See: https://remotion.dev/docs/staticfile-remote-urls`
		);
	}

	if (path.startsWith('..') || path.startsWith('./')) {
		throw new TypeError(
			`staticFile() does not support relative paths - got "${path}". Instead, pass the name of a file that is inside the public/ folder. See: https://remotion.dev/docs/staticfile-relative-paths`
		);
	}

	if (
		path.startsWith('/Users') ||
		path.startsWith('/home') ||
		path.startsWith('/tmp') ||
		path.startsWith('/etc') ||
		path.startsWith('/opt') ||
		path.startsWith('/var') ||
		path.startsWith('C:') ||
		path.startsWith('D:') ||
		path.startsWith('E:')
	) {
		throw new TypeError(
			`staticFile() does not support absolute paths - got "${path}". Instead, pass the name of a file that is inside the public/ folder. See: https://remotion.dev/docs/staticfile-relative-paths`
		);
	}

	if (path.startsWith('public/')) {
		throw new TypeError(
			`Do not include the public/ prefix when using staticFile() - got "${path}". See: https://remotion.dev/docs/staticfile-relative-paths`
		);
	}

	const includesHex = includesHexOfUnsafeChar(path);
	if (includesHex.containsHex) {
		warnOnce(
			`WARNING: You seem to pass an already encoded path (path contains ${includesHex.hexCode}). The encoding gets automatically handled by staticFile()  `
		);
	}

	const preparsed = inner(encodeURIComponent(path));

	if (!preparsed.startsWith('/')) {
		return `/${preparsed}`;
	}

	return preparsed;
};
