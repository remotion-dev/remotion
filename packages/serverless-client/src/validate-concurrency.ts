import {
	MAX_FUNCTIONS_PER_RENDER,
	MINIMUM_FRAMES_PER_FUNCTIONS,
} from './constants';

export const shouldIgnoreConcurrency = ({
	concurrency,
	durationInFrames,
}: {
	concurrency: number;
	durationInFrames: number;
}): boolean => {
	// Calculate framesPerLambda from concurrency
	const calculatedFramesPerLambda = Math.ceil(durationInFrames / concurrency);

	// Check if the calculated framesPerLambda meets minimum requirements
	const effectiveMinimum = Math.min(
		MINIMUM_FRAMES_PER_FUNCTIONS,
		durationInFrames,
	);

	// If the calculated framesPerLambda would be less than the minimum, ignore the concurrency setting
	return calculatedFramesPerLambda < effectiveMinimum;
};

export const validateConcurrency = ({
	concurrency,
	framesPerFunction,
	durationInFrames,
}: {
	concurrency: unknown;
	framesPerFunction: unknown;
	durationInFrames: number;
}) => {
	// If concurrency is not provided, skip validation
	if (concurrency === null || concurrency === undefined) {
		return;
	}

	// Validate concurrency is a number
	if (typeof concurrency !== 'number') {
		throw new TypeError(
			`'concurrency' needs to be a number, passed ${JSON.stringify(
				concurrency,
			)}`,
		);
	}

	// Validate concurrency is finite
	if (!Number.isFinite(concurrency)) {
		throw new TypeError(
			`'concurrency' needs to be finite, passed ${concurrency}`,
		);
	}

	// Validate concurrency is not NaN
	if (Number.isNaN(concurrency)) {
		throw new TypeError(
			`'concurrency' needs to be a valid number, passed ${concurrency}`,
		);
	}

	// Validate concurrency is an integer
	if (concurrency % 1 !== 0) {
		throw new TypeError(
			`'concurrency' needs to be an integer, passed ${concurrency}`,
		);
	}

	// Validate concurrency is positive
	if (concurrency <= 0) {
		throw new TypeError(
			`'concurrency' needs to be positive, passed ${concurrency}`,
		);
	}

	// Validate concurrency doesn't exceed maximum
	if (concurrency > MAX_FUNCTIONS_PER_RENDER) {
		throw new TypeError(
			`'concurrency' cannot exceed ${MAX_FUNCTIONS_PER_RENDER}, passed ${concurrency}`,
		);
	}

	// If the calculated framesPerLambda would be less than the minimum, ignore the concurrency setting
	if (shouldIgnoreConcurrency({concurrency, durationInFrames})) {
		// Return without throwing an error - this effectively ignores the concurrency setting
		return;
	}

	// Validate mutual exclusivity with framesPerFunction
	if (framesPerFunction !== null && framesPerFunction !== undefined) {
		throw new TypeError(
			`Cannot specify both 'concurrency' and 'framesPerLambda'. Please use only one of them.`,
		);
	}
};
