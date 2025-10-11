import {bestFramesPerFunctionParam} from './best-frames-per-function-param';
import {
	MAX_FUNCTIONS_PER_RENDER,
	MINIMUM_FRAMES_PER_FUNCTION,
} from './constants';

export const validateFramesPerFunction = ({
	framesPerFunction,
	durationInFrames,
	concurrency,
}: {
	framesPerFunction: number | null;
	durationInFrames: number;
	concurrency: number | null;
}): number => {
	if (concurrency !== null && framesPerFunction !== null) {
		throw new TypeError(
			`Both 'framesPerLambda' and 'concurrency' were set. Please use only one of them.`,
		);
	}

	const effectiveMinimum = Math.min(
		MINIMUM_FRAMES_PER_FUNCTION,
		durationInFrames,
	);

	if (concurrency !== null) {
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

		return Math.max(
			Math.ceil(durationInFrames / concurrency),
			effectiveMinimum,
		);
	}

	if (framesPerFunction === null) {
		return Math.max(
			bestFramesPerFunctionParam(durationInFrames),
			effectiveMinimum,
		);
	}

	if (framesPerFunction === undefined) {
		return Math.max(
			bestFramesPerFunctionParam(durationInFrames),
			effectiveMinimum,
		);
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

	if (framesPerFunction < effectiveMinimum) {
		throw new TypeError(
			`The framesPerLambda needs to be at least ${effectiveMinimum}, but is ${framesPerFunction}`,
		);
	}

	return framesPerFunction;
};
