const trimLeadingSlash = (path: string): string => {
	if (path.startsWith('/')) {
		return trimLeadingSlash(path.substr(1));
	}

	return path;
};

const inner = (path: string): string => {
	if (typeof window !== 'undefined' && window.remotion_staticBase) {
		return `${window.remotion_staticBase}/${trimLeadingSlash(path)}`;
	}

	return `/${trimLeadingSlash(path)}`;
};

export const staticFile = (path: string) => {
	if (path.startsWith('..') || path.startsWith('./')) {
		throw new TypeError(
			`staticFile() does not support relative paths - got "${path}". Instead, pass the name of a file that is inside the public/ folder. See: https://remotion.dev/docs/staticfile-relative-paths`
		);
	}

	const preparsed = inner(path);
	if (!preparsed.startsWith('/')) {
		return `/${preparsed}`;
	}

	return preparsed;
};
