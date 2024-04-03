import type {AnyComposition} from 'remotion';
import {Internals} from 'remotion';

export const validateCompositionName = (
	compName: string,
	compositions: AnyComposition[],
): string | null => {
	if (!Internals.isCompositionIdValid(compName)) {
		return Internals.invalidCompositionErrorMessage;
	}

	if (compositions.find((c) => c.id === compName)) {
		return `A composition with that name already exists.`;
	}

	return null;
};

export const validateCompositionDimension = (
	dimension: 'Width' | 'Height',
	value: number,
): string | null => {
	if (Number(value) % 2 !== 0) {
		return `${dimension} should be divisible by 2, since H264 codec doesn't support odd dimensions.`;
	}

	if (Number.isNaN(Number(value))) {
		return 'Invalid number.';
	}

	if (Number(value) === 0) {
		return dimension + ' cannot be zero.';
	}

	return null;
};

export const validateCompositionDuration = (value: number): string | null => {
	if (value % 1 !== 0) {
		return `Duration must be an integer.`;
	}

	if (Number.isNaN(value)) {
		return 'Invalid number.';
	}

	if (value === 0) {
		return 'Duration cannot be zero.';
	}

	return null;
};
