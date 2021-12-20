const trimLeadingSlash = (path: string) => {
	if (path.startsWith('/')) {
		return path.substr(1);
	}

	return path;
};

const inner = (path: string): string => {
	if (window.remotion_staticBase) {
		return `/static-${window.remotion_staticBase}/${trimLeadingSlash(path)}`;
	}

	return `/${trimLeadingSlash(path)}`;
};

export const staticFile = (path: string) => {
	const preparsed = inner(path);
	if (!preparsed.startsWith('/')) {
		return `/${preparsed}`;
	}

	return preparsed;
};
