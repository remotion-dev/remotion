export const validatePuppeteerTimeout = (timeoutInMilliseconds: unknown) => {
	if (timeoutInMilliseconds === null || timeoutInMilliseconds === undefined) {
		return;
	}

	if (typeof timeoutInMilliseconds !== 'number') {
		throw new TypeError(
			`'timeoutInMilliseconds' should be a number, but is: ${JSON.stringify(
				timeoutInMilliseconds,
			)}`,
		);
	}

	// Value also appears in packages/cli/src/editor/components/RenderModal/RenderModalAdvanced.tsx
	if (timeoutInMilliseconds < 7000 && process.env.NODE_ENV !== 'test') {
		throw new TypeError(
			`'timeoutInMilliseconds' should be bigger or equal than 7000, but is ${timeoutInMilliseconds}`,
		);
	}

	if (Number.isNaN(timeoutInMilliseconds)) {
		throw new TypeError(
			`'timeoutInMilliseconds' should not be NaN, but is ${timeoutInMilliseconds}`,
		);
	}

	if (!Number.isFinite(timeoutInMilliseconds)) {
		throw new TypeError(
			`'timeoutInMilliseconds' should be finite, but is ${timeoutInMilliseconds}`,
		);
	}

	if (timeoutInMilliseconds % 1 !== 0) {
		throw new TypeError(
			`'timeoutInMilliseconds' should be an integer, but is ${timeoutInMilliseconds}`,
		);
	}
};
