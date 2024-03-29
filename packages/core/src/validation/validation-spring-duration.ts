export const validateSpringDuration = (dur: unknown) => {
	if (typeof dur === 'undefined') {
		return;
	}

	if (typeof dur !== 'number') {
		throw new TypeError(
			`A "duration" of a spring must be a "number" but is "${typeof dur}"`,
		);
	}

	if (Number.isNaN(dur)) {
		throw new TypeError(
			'A "duration" of a spring is NaN, which it must not be',
		);
	}

	if (!Number.isFinite(dur)) {
		throw new TypeError(
			'A "duration" of a spring must be finite, but is ' + dur,
		);
	}

	if (dur <= 0) {
		throw new TypeError(
			'A "duration" of a spring must be positive, but is ' + dur,
		);
	}
};
