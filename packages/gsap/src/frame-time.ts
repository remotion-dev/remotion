export const frameToSeconds = (frame: number, fps: number): number => {
	if (!Number.isFinite(frame)) {
		throw new TypeError(`frame must be finite, received ${String(frame)}`);
	}

	if (!Number.isFinite(fps) || fps <= 0) {
		throw new RangeError(
			`fps must be a positive finite number, received ${String(fps)}`,
		);
	}

	return Math.max(0, frame) / fps;
};
