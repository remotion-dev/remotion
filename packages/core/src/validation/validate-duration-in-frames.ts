export const validateDurationInFrames = (durationInFrames: number) => {
	if (typeof durationInFrames !== 'number') {
		throw new Error(
			`The "durationInFrames" of a composition must be a number, but you passed a value of type ${typeof durationInFrames}`
		);
	}

	if (durationInFrames <= 0) {
		throw new TypeError(
			`The "durationInFrames" of a composition must be positive, but got ${durationInFrames}.`
		);
	}

	if (durationInFrames % 1 !== 0) {
		throw new TypeError(
			`The "durationInFrames" of a composition must be an integer, but got ${durationInFrames}.`
		);
	}
};
