export const validateScale = (scale: unknown) => {
	if (typeof scale === 'undefined') {
		return;
	}

	if (typeof scale !== 'number') {
		throw new Error(
			'Scale should be a number or undefined, but is "' +
				JSON.stringify(scale) +
				'"',
		);
	}

	if (Number.isNaN(scale)) {
		throw new Error('`scale` should not be NaN, but is NaN');
	}

	if (!Number.isFinite(scale)) {
		throw new Error(`"scale" must be finite, but is ${scale}`);
	}

	if (scale <= 0) {
		throw new Error(`"scale" must be bigger than 0, but is ${scale}`);
	}

	if (scale > 16) {
		throw new Error(
			`"scale" must be smaller or equal than 16, but is ${scale}`,
		);
	}
};
