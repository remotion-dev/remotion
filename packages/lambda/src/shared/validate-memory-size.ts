import {MAX_MEMORY, MIN_MEMORY} from './constants';

export const validateMemorySize = (memorySize: unknown) => {
	if (typeof memorySize !== 'number') {
		throw new TypeError(
			`parameter 'memorySize' must be a number, got a ${typeof memorySize}`
		);
	}

	if (Number.isNaN(memorySize)) {
		throw new TypeError(`parameter 'memorySize' must not be NaN, but is`);
	}

	if (!Number.isFinite(memorySize)) {
		throw new TypeError(
			`parameter 'memorySize' must be finite, but is ${memorySize}`
		);
	}

	if (memorySize < MIN_MEMORY || memorySize > MAX_MEMORY) {
		throw new TypeError(
			`parameter 'memorySize' must be between ${MIN_MEMORY} and ${MAX_MEMORY}, but got ${memorySize}`
		);
	}

	if (memorySize % 1 !== 0) {
		throw new TypeError(
			`parameter 'memorySize' must be an integer but got ${memorySize}`
		);
	}
};
