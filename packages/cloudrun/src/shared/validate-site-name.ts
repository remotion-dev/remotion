export const validateSiteName = (siteName: unknown) => {
	if (typeof siteName === 'undefined') {
		return;
	}

	if (typeof siteName !== 'string') {
		throw new TypeError(
			`The 'projectName' argument must be a string if provided, but is ${JSON.stringify(
				siteName,
			)}`,
		);
	}

	if (!siteName.match(/([0-9a-zA-Z-!_.*'()]+)/g)) {
		throw new Error(
			"The `siteName` must match the RegExp `/([0-9a-zA-Z-!_.*'()]+)/g`. You passed: " +
				siteName +
				'. Check for invalid characters.',
		);
	}
};
