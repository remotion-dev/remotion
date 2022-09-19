import {MINIMUM_FRAMES_PER_LAMBDA} from './constants';

export const validateFramesPerLambda = ({
	framesPerLambda,
	durationInFrames,
}: {
	framesPerLambda: unknown;
	durationInFrames: number;
}) => {
	if (framesPerLambda === null) {
		return;
	}

	if (framesPerLambda === undefined) {
		return;
	}

	if (typeof framesPerLambda !== 'number') {
		throw new TypeError(
			`'framesPerLambda' needs to be a number, passed ${JSON.stringify(
				framesPerLambda
			)}`
		);
	}

	if (!Number.isFinite(framesPerLambda)) {
		throw new TypeError(
			`'framesPerLambda' needs to be finite, passed ${framesPerLambda}`
		);
	}

	if (Number.isNaN(framesPerLambda)) {
		throw new TypeError(
			`'framesPerLambda' needs to be NaN, passed ${framesPerLambda}`
		);
	}

	if (framesPerLambda % 1 !== 0) {
		throw new TypeError(
			`'framesPerLambda' needs to be an integer, passed ${framesPerLambda}`
		);
	}

	const effectiveMinimum = Math.min(
		MINIMUM_FRAMES_PER_LAMBDA,
		durationInFrames
	);

	if (framesPerLambda < effectiveMinimum) {
		throw new TypeError(
			`The framesPerLambda needs to be at least ${effectiveMinimum}, but is ${framesPerLambda}`
		);
	}
};
