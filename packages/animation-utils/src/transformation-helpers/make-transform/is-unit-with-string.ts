import {lengthUnits} from '../../type';

export const isUnitWithString = (input: unknown, units: readonly string[]) => {
	if (typeof input !== 'string') {
		return false;
	}

	if (!units.find((u) => input.endsWith(u))) {
		throw new Error(
			`input ${input} does not end with a valid unit. Valid units are: ${units.join(
				', ',
			)}`,
		);
	}

	const match = input.match(/([0-9.]+)([a-z%]+)/);
	if (!match) {
		throw new Error(
			`input ${input} is not a valid transform. Must be a number or a string ending in one of the following units: ${lengthUnits.join(
				', ',
			)}`,
		);
	}

	return true;
};
