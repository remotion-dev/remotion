export const canPremountInHtmlInCanvas = (): boolean => {
	if (typeof navigator === 'undefined') {
		return false;
	}

	const chromeVersion = navigator.userAgent.match(
		/(?:Chrome|Chromium)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/,
	);
	if (!chromeVersion) {
		return false;
	}

	// Earlier builds can crash when premounting nested drawable canvases.
	// https://chromium-review.googlesource.com/c/chromium/src/+/8613587
	const minimumVersion = [158, 0, 8127, 2];
	const version = chromeVersion.slice(1).map(Number);
	for (let i = 0; i < minimumVersion.length; i++) {
		if (version[i] !== minimumVersion[i]) {
			return version[i] > minimumVersion[i];
		}
	}

	return true;
};
