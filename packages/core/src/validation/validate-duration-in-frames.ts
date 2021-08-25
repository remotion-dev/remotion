export const validateDurationInFrames = (
	durationInFrames: number,
	componentName: string
) => {
	if (typeof durationInFrames !== 'number') {
		throw new Error(
			`The "durationInFrames" prop of a ${componentName} component must be a number, but you passed a value of type ${typeof durationInFrames}`
		);
	}

	if (durationInFrames <= 0) {
		throw new TypeError(
			`The "durationInFrames" prop of a ${componentName} component must be positive, but got ${durationInFrames}.`
		);
	}

	if (durationInFrames % 1 !== 0) {
		throw new TypeError(
			`The "durationInFrames" prop of a ${componentName} component must be an integer, but got ${durationInFrames}.`
		);
	}
};
