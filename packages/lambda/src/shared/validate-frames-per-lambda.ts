import {MINIMUM_FRAMES_PER_LAMBDA} from './constants';

export const validateFramesPerLambda = (framesPerLambda: unknown) => {
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

	if (framesPerLambda < MINIMUM_FRAMES_PER_LAMBDA) {
		throw new TypeError(
			`The framesPerLambda needs to be at least 4, but is ${framesPerLambda}`
		);
	}
};
