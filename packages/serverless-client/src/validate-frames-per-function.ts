import {MINIMUM_FRAMES_PER_FUNCTIONS} from './constants';

export const validateFramesPerFunction = ({
	framesPerFunction,
	durationInFrames,
}: {
	framesPerFunction: unknown;
	durationInFrames: number;
}) => {
	if (framesPerFunction === null) {
		return;
	}

	if (framesPerFunction === undefined) {
		return;
	}

	if (typeof framesPerFunction !== 'number') {
		throw new TypeError(
			`'framesPerLambda' needs to be a number, passed ${JSON.stringify(
				framesPerFunction,
			)}`,
		);
	}

	if (!Number.isFinite(framesPerFunction)) {
		throw new TypeError(
			`'framesPerLambda' needs to be finite, passed ${framesPerFunction}`,
		);
	}

	if (Number.isNaN(framesPerFunction)) {
		throw new TypeError(
			`'framesPerLambda' needs to be NaN, passed ${framesPerFunction}`,
		);
	}

	if (framesPerFunction % 1 !== 0) {
		throw new TypeError(
			`'framesPerLambda' needs to be an integer, passed ${framesPerFunction}`,
		);
	}

	const effectiveMinimum = Math.min(
		MINIMUM_FRAMES_PER_FUNCTIONS,
		durationInFrames,
	);

	if (framesPerFunction < effectiveMinimum) {
		throw new TypeError(
			`The framesPerLambda needs to be at least ${effectiveMinimum}, but is ${framesPerFunction}`,
		);
	}
};
