export const validateFramesPerLambda = (framesPerLambda: unknown) => {
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

	if (framesPerLambda < 4) {
		throw new TypeError('The framesPerLambda needs to be at least 4.');
	}
};
