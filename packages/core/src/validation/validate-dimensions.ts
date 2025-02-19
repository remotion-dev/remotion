export function validateDimension(
	amount: unknown,
	nameOfProp: string,
	location: string,
): asserts amount is number {
	if (typeof amount !== 'number') {
		throw new Error(
			`The "${nameOfProp}" prop ${location} must be a number, but you passed a value of type ${typeof amount}`,
		);
	}

	if (isNaN(amount)) {
		throw new TypeError(
			`The "${nameOfProp}" prop ${location} must not be NaN, but is NaN.`,
		);
	}

	if (!Number.isFinite(amount)) {
		throw new TypeError(
			`The "${nameOfProp}" prop ${location} must be finite, but is ${amount}.`,
		);
	}

	if (amount % 1 !== 0) {
		throw new TypeError(
			`The "${nameOfProp}" prop ${location} must be an integer, but is ${amount}.`,
		);
	}

	if (amount <= 0) {
		throw new TypeError(
			`The "${nameOfProp}" prop ${location} must be positive, but got ${amount}.`,
		);
	}
}
