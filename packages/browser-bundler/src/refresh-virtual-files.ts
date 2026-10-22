declare const __BROWSER_BUNDLER_REACT_REFRESH_FILES__: {
	entry: string;
	runtime: string;
	utils: string;
};

export const getBrowserReactRefreshVirtualFiles = ({
	entry,
	runtime,
	utils,
}: {
	entry: string;
	runtime: string;
	utils: string;
}): Record<string, string> => {
	if (typeof __BROWSER_BUNDLER_REACT_REFRESH_FILES__ === 'undefined') {
		throw new Error('Browser bundler React Refresh files were not injected.');
	}

	return {
		[entry]: __BROWSER_BUNDLER_REACT_REFRESH_FILES__.entry,
		[runtime]: __BROWSER_BUNDLER_REACT_REFRESH_FILES__.runtime,
		[utils]: __BROWSER_BUNDLER_REACT_REFRESH_FILES__.utils,
	};
};
