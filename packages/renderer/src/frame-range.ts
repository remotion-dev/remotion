export type FrameRange = number | [number, number];
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

		for (const value of frameRange) {
			if (typeof value !== 'number') {
				throw new Error(
					`Each value of frame range must be a number, but got ${typeof value} (${JSON.stringify(
						value,
					)})`,
				);
			}

			if (!Number.isFinite(value)) {
				throw new TypeError(
					'Each value of frame range must be finite, but got ' + value,
				);
			}

			if (!Number.isInteger(value)) {
				throw new Error(
					`Each value of frame range must be an integer, but got a float (${value})`,
				);
			}

			if (value < 0) {
				throw new Error(
					`Each value of frame range must be non-negative, but got ${value}`,
				);
			}
		}

		const [first, second] = frameRange;
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
