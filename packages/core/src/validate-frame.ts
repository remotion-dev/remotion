export const validateFrame = ({
	allowFloats,
	durationInFrames,
	frame,
}: {
	frame: number;
	durationInFrames: number;
	allowFloats: boolean;
}) => {
	if (typeof frame === 'undefined') {
		throw new TypeError(`Argument missing for parameter "frame"`);
	}

	if (typeof frame !== 'number') {
		throw new TypeError(
			`Argument passed for "frame" is not a number: ${frame}`,
		);
	}

	if (!Number.isFinite(frame)) {
		throw new RangeError(`Frame ${frame} is not finite`);
	}

	if (frame % 1 !== 0 && !allowFloats) {
		throw new RangeError(
			`Argument for frame must be an integer, but got ${frame}`,
		);
	}

	if (frame < 0 && frame < -durationInFrames) {
		throw new RangeError(
			`Cannot use frame ${frame}: Duration of composition is ${durationInFrames}, therefore the lowest frame that can be rendered is ${-durationInFrames}`,
		);
	}

	if (frame > durationInFrames - 1) {
		throw new RangeError(
			`Cannot use frame ${frame}: Duration of composition is ${durationInFrames}, therefore the highest frame that can be rendered is ${
				durationInFrames - 1
			}`,
		);
	}
};
