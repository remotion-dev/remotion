export const validateSiteName = (siteName: string) => {
	if (!siteName.match(/([0-9a-zA-Z-!_.*'()]+)/g)) {
		throw new Error(
			"The `siteName` must match the RegExp `/([0-9a-zA-Z-!_.*'()]+)/g`. You passed: " +
				siteName +
				'. Check for invalid characters.'
		);
	}
};
