export const validateSelectedFrames = ({
	frames,
	durationInFrames,
}: {
	frames: unknown;
	durationInFrames: number | null;
}): number[] => {
	if (!Array.isArray(frames)) {
		throw new TypeError(
			'The `frames` option must be an array of frame numbers.',
		);
	}

	if (frames.length === 0) {
		throw new TypeError('The `frames` option must contain at least one frame.');
	}

	for (const frame of frames) {
		if (typeof frame !== 'number') {
			throw new TypeError(
				`The \`frames\` option must contain only numbers, but got ${typeof frame}.`,
			);
		}

		if (!Number.isFinite(frame)) {
			throw new TypeError(
				`The \`frames\` option must contain only finite numbers, but got ${frame}.`,
			);
		}

		if (!Number.isInteger(frame)) {
			throw new TypeError(
				`The \`frames\` option must contain only integers, but got ${frame}.`,
			);
		}

		if (frame < 0) {
			throw new TypeError(
				`The \`frames\` option must contain only non-negative numbers, but got ${frame}.`,
			);
		}

		if (durationInFrames !== null && frame >= durationInFrames) {
			throw new RangeError(
				`Frame ${frame} is out of range, must be between 0 and ${durationInFrames - 1}.`,
			);
		}
	}

	const uniqueFrames = new Set(frames);
	if (uniqueFrames.size !== frames.length) {
		throw new TypeError(
			'The `frames` option must not contain duplicate frames.',
		);
	}

	return [...frames].sort((a, b) => a - b);
};
