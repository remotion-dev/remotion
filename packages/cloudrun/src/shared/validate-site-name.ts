const VALID_SITE_NAME_RE = /^[-0-9a-zA-Z!_.*'()]+$/;

export const validateSiteName = (siteName: unknown) => {
	if (typeof siteName === 'undefined') {
		return;
	}

	if (typeof siteName !== 'string') {
		throw new TypeError(
			`The 'siteName' argument must be a string if provided, but is ${JSON.stringify(
				siteName,
			)}`,
		);
	}

	if (siteName === '.' || siteName === '..') {
		throw new Error(
			'The `siteName` must not be `.` or `..`. You passed: ' + siteName + '.',
		);
	}

	if (!VALID_SITE_NAME_RE.test(siteName)) {
		throw new Error(
			'The `siteName` must match the RegExp `/' +
				VALID_SITE_NAME_RE.source +
				'/`. You passed: ' +
				siteName +
				'. Check for invalid characters.',
		);
	}
};
