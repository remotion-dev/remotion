export function validateDurationInFrames(
	durationInFrames: unknown,
	options: {
		component: string;
		allowFloats: boolean;
	},
): asserts durationInFrames is number {
	const {allowFloats, component} = options;
	if (typeof durationInFrames === 'undefined') {
		throw new Error(`The "durationInFrames" prop ${component} is missing.`);
	}

	if (typeof durationInFrames !== 'number') {
		throw new Error(
			`The "durationInFrames" prop ${component} must be a number, but you passed a value of type ${typeof durationInFrames}`,
		);
	}

	if (durationInFrames <= 0) {
		throw new TypeError(
			`The "durationInFrames" prop ${component} must be positive, but got ${durationInFrames}.`,
		);
	}

	if (!allowFloats && durationInFrames % 1 !== 0) {
		throw new TypeError(
			`The "durationInFrames" prop ${component} must be an integer, but got ${durationInFrames}.`,
		);
	}

	if (!Number.isFinite(durationInFrames)) {
		throw new TypeError(
			`The "durationInFrames" prop ${component} must be finite, but got ${durationInFrames}.`,
		);
	}
}
