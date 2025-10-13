let browserCanUseWebGl2: null | boolean = null;

const browserCanUseWebGl2Uncached = () => {
	const canvas = new OffscreenCanvas(1, 1);
	const context = canvas.getContext('webgl2');
	return context !== null;
};

export const canBrowserUseWebGl2 = () => {
	if (browserCanUseWebGl2 !== null) {
		return browserCanUseWebGl2;
	}

	browserCanUseWebGl2 = browserCanUseWebGl2Uncached();
	return browserCanUseWebGl2;
};
