export const validateDurationInFrames = ({
	allowFloats,
	component,
	durationInFrames,
}: {
	durationInFrames: number;
	component: string;
	allowFloats: boolean;
}) => {
	if (typeof durationInFrames !== 'number') {
		throw new Error(
			`The "durationInFrames" prop ${component} must be a number, but you passed a value of type ${typeof durationInFrames}`
		);
	}

	if (durationInFrames <= 0) {
		throw new TypeError(
			`The "durationInFrames" prop ${component} must be positive, but got ${durationInFrames}.`
		);
	}

	if (!allowFloats && durationInFrames % 1 !== 0) {
		throw new TypeError(
			`The "durationInFrames" prop ${component} must be an integer, but got ${durationInFrames}.`
		);
	}

	if (!Number.isFinite(durationInFrames)) {
		throw new TypeError(
			`The "durationInFrames" prop ${component} must be finite, but got ${durationInFrames}.`
		);
	}
};
