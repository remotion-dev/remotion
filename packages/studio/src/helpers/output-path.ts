// This is a Studio navigation path, not a filesystem path. Keep the filename
// raw, including backslashes and percent signs, until constructing a URL.
export const normalizeOutputPath = (path: string): string => {
	return `/${path.replace(/^\/+/, '')}`;
};

export const getEncodedOutputPath = (path: string): string => {
	return normalizeOutputPath(path).split('/').map(encodeURIComponent).join('/');
};

export const getOutputRoute = (path: string): string => {
	return `/outputs${getEncodedOutputPath(path)}`;
};
