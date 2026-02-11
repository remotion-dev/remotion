export type FrameRange = number | [number, number] | [number, null];
export const validateFrameRange = (frameRange: FrameRange | null) => {
	if (frameRange === null) {
		return;
	}

	if (typeof frameRange === 'number') {
		if (frameRange < 0) {
			throw new TypeError(
				'Frame must be a non-negative number, got ' + frameRange,
			);
		}

		if (!Number.isFinite(frameRange)) {
			throw new TypeError('Frame must be a finite number, got ' + frameRange);
		}

		if (!Number.isInteger(frameRange)) {
			throw new Error(
				`Frame must be an integer, but got a float (${frameRange})`,
			);
		}

		return;
	}

	if (Array.isArray(frameRange)) {
		if (frameRange.length !== 2) {
			throw new TypeError(
				'Frame range must be a tuple, got an array with length ' +
					frameRange.length,
			);
		}

		const [first, second] = frameRange;

		if (typeof first !== 'number') {
			throw new Error(
				`The first value of frame range must be a number, but got ${typeof first} (${JSON.stringify(
					first,
				)})`,
			);
		}

		if (!Number.isFinite(first)) {
			throw new TypeError(
				'The first value of frame range must be finite, but got ' + first,
			);
		}

		if (!Number.isInteger(first)) {
			throw new Error(
				`The first value of frame range must be an integer, but got a float (${first})`,
			);
		}

		if (first < 0) {
			throw new Error(
				`The first value of frame range must be non-negative, but got ${first}`,
			);
		}

		if (second === null) {
			return;
		}

		if (typeof second !== 'number') {
			throw new Error(
				`The second value of frame range must be a number or null, but got ${typeof second} (${JSON.stringify(
					second,
				)})`,
			);
		}

		if (!Number.isFinite(second)) {
			throw new TypeError(
				'The second value of frame range must be finite, but got ' + second,
			);
		}

		if (!Number.isInteger(second)) {
			throw new Error(
				`The second value of frame range must be an integer, but got a float (${second})`,
			);
		}

		if (second < 0) {
			throw new Error(
				`The second value of frame range must be non-negative, but got ${second}`,
			);
		}

		if (second < first) {
			throw new Error(
				'The second value of frame range must be not smaller than the first one, but got ' +
					frameRange.join('-'),
			);
		}

		return;
	}

	throw new TypeError(
		'Frame range must be a number or a tuple of numbers, but got object of type ' +
			typeof frameRange,
	);
};
