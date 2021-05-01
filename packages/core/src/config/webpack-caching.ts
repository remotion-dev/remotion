export const DEFAULT_WEBPACK_CACHE_ENABLED = true;

let webpackCaching = DEFAULT_WEBPACK_CACHE_ENABLED;

export const setWebpackCaching = (flag: boolean) => {
	if (typeof flag !== 'boolean') {
		throw new TypeError('Caching flag must be a boolean.');
	}

	webpackCaching = flag;
};

export const getWebpackCaching = () => {
	return webpackCaching;
};
