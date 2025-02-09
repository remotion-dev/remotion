import {
	MAX_EPHEMERAL_STORAGE_IN_MB,
	MIN_EPHEMERAL_STORAGE_IN_MB,
} from './constants';

export const validateDiskSizeInMb = (diskSizeInMb: unknown) => {
	if (typeof diskSizeInMb !== 'number') {
		throw new TypeError(
			`parameter 'diskSizeInMb' must be a number, got a ${typeof diskSizeInMb}`,
		);
	}

	if (Number.isNaN(diskSizeInMb)) {
		throw new TypeError(`parameter 'diskSizeInMb' must not be NaN, but is`);
	}

	if (!Number.isFinite(diskSizeInMb)) {
		throw new TypeError(
			`parameter 'diskSizeInMb' must be finite, but is ${diskSizeInMb}`,
		);
	}

	if (
		diskSizeInMb < MIN_EPHEMERAL_STORAGE_IN_MB ||
		diskSizeInMb > MAX_EPHEMERAL_STORAGE_IN_MB
	) {
		throw new TypeError(
			`parameter 'diskSizeInMb' must be between ${MIN_EPHEMERAL_STORAGE_IN_MB} and ${MAX_EPHEMERAL_STORAGE_IN_MB}, but got ${diskSizeInMb}`,
		);
	}

	if (diskSizeInMb % 1 !== 0) {
		throw new TypeError(
			`parameter 'diskSizeInMb' must be an integer but got ${diskSizeInMb}`,
		);
	}
};
