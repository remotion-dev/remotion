export const assertEffectParamsObject = (
	params: unknown,
	effectLabel: string,
): void => {
	if (params === null || typeof params !== 'object') {
		throw new TypeError(
			`${effectLabel} effect requires a parameters object, but got ${JSON.stringify(params)}`,
		);
	}
};

export const assertRequiredFiniteNumber = (
	value: unknown,
	name: string,
): void => {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw new TypeError(
			`"${name}" must be a finite number, but got ${JSON.stringify(value)}`,
		);
	}
};

export const assertRequiredColor = (value: unknown, name: string): void => {
	if (typeof value !== 'string' || value.length === 0) {
		throw new TypeError(
			`"${name}" must be a non-empty string, but got ${JSON.stringify(value)}`,
		);
	}
};

export const assertOptionalColor = (value: unknown, name: string): void => {
	if (value === undefined) {
		return;
	}

	assertRequiredColor(value, name);
};

export const assertOptionalBoolean = (value: unknown, name: string): void => {
	if (value === undefined) {
		return;
	}

	if (typeof value !== 'boolean') {
		throw new TypeError(
			`"${name}" must be a boolean, but got ${JSON.stringify(value)}`,
		);
	}
};
