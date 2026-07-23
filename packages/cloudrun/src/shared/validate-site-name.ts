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
			"The `siteName` must match the RegExp `/^[0-9a-zA-Z-!_.*'()]+$/`. You passed: " +
				siteName +
				'. Check for invalid characters.',
		);
	}

	if (!/^[0-9a-zA-Z-!_.*'()]+$/.test(siteName)) {
		throw new Error(
			"The `siteName` must match the RegExp `/^[0-9a-zA-Z-!_.*'()]+$/`. You passed: " +
				siteName +
				'. Check for invalid characters.',
		);
	}
};
