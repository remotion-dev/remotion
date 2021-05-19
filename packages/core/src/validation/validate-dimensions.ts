export const validateDimension = (amount: number, nameOfProp: string) => {
	if (typeof amount !== 'number') {
		throw new Error(
			`The "${nameOfProp}" of a composition must be a number, but you passed a value of type ${typeof amount}`
		);
	}

	if (isNaN(amount)) {
		throw new TypeError(
			`The "${nameOfProp}" of a composition must not be NaN, but is NaN.`
		);
	}

	if (!Number.isFinite(amount)) {
		throw new TypeError(
			`The "${nameOfProp}" of a composition must be finite, but is ${amount}.`
		);
	}

	if (amount % 1 !== 0) {
		throw new TypeError(
			`The "${nameOfProp}" of a composition must be an integer, but is ${amount}.`
		);
	}

	if (amount <= 0) {
		throw new TypeError(
			`The "${nameOfProp}" of a composition must be positive, but got ${amount}.`
		);
	}
};
