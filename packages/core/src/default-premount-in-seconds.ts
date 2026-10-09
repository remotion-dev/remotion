import {ENABLE_V5_BREAKING_CHANGES} from './v5-flag.js';

export const DEFAULT_PREMOUNT_IN_SECONDS = ENABLE_V5_BREAKING_CHANGES ? 2 : 0;

export const validateDefaultPremountInSeconds = (value: unknown) => {
	if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
		throw new TypeError(
			`defaultPremountInSeconds must be a finite, non-negative number, but got ${String(value)}.`,
		);
	}
};
