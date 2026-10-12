export const DEFAULT_PREMOUNT_IN_SECONDS = 0;
export const DEFAULT_STUDIO_PREMOUNT_IN_SECONDS = 2;

export const validateDefaultPremountInSeconds = (value: unknown) => {
	if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
		throw new TypeError(
			`defaultPremountInSeconds must be a finite, non-negative number, but got ${String(value)}.`,
		);
	}
};
