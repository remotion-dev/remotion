export const validatePlaybackRate = (playbackRate: unknown) => {
	if (typeof playbackRate === 'undefined') {
		return;
	}

	if (typeof playbackRate !== 'number') {
		throw new TypeError(
			`The "playbackRate" prop must be a number or undefined, but is ${JSON.stringify(
				playbackRate,
			)}`,
		);
	}

	if (Number.isNaN(playbackRate) || !Number.isFinite(playbackRate)) {
		throw new TypeError(
			`The "playbackRate" props must be a real number, but is ${playbackRate}`,
		);
	}

	if (playbackRate <= 0) {
		throw new TypeError(
			`The "playbackRate" props must be positive, but is ${playbackRate}`,
		);
	}
};
