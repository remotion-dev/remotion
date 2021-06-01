export const validateDimension = (
	amount: number,
	nameOfProp: string,
	componentName: string
) => {
	if (typeof amount !== 'number') {
		throw new Error(
			`The "${nameOfProp}" prop of the <${componentName}/> component must be a number, but you passed a value of type ${typeof amount}`
		);
	}

	if (isNaN(amount)) {
		throw new TypeError(
			`The "${nameOfProp}" prop of the <${componentName}/> component must not be NaN, but is NaN.`
		);
	}

	if (!Number.isFinite(amount)) {
		throw new TypeError(
			`The "${nameOfProp}" prop of the <${componentName}/> component must be finite, but is ${amount}.`
		);
	}

	if (amount % 1 !== 0) {
		throw new TypeError(
			`The "${nameOfProp}" prop of the <${componentName}/> component must be an integer, but is ${amount}.`
		);
	}

	if (amount <= 0) {
		throw new TypeError(
			`The "${nameOfProp}" prop of the <${componentName}/> component must be positive, but got ${amount}.`
		);
	}
};
