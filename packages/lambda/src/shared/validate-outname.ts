export const validateOutname = (outName: string | null) => {
	if (outName === null) {
		return;
	}

	if (typeof outName !== 'string') {
		throw new TypeError(
			'The `outName` property must be a string. Passed an object of type ' +
				typeof outName
		);
	}

	if (!outName.match(/([0-9a-zA-Z-!_.*'()]+)/g)) {
		throw new Error(
			"The `outName` must match the RegExp `/([0-9a-zA-Z-!_.*'()]+)/g`. You passed: " +
				outName +
				'. Check for invalid characters.'
		);
	}
};
