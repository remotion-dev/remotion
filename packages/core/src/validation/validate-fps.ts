export const validateFps = (fps: number) => {
	if (typeof fps !== 'number') {
		throw new Error(`"fps" must be a number, but you passed a ${typeof fps}`);
	}

	if (!Number.isFinite(fps)) {
		throw new Error(`"fps" must be a finite, but you passed ${fps}`);
	}

	if (isNaN(fps)) {
		throw new Error(`"fps" must not be NaN, but got ${fps}`);
	}

	if (fps <= 0) {
		throw new TypeError(`"fps" must be positive, but got ${fps}.`);
	}
};
