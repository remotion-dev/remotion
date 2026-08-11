export const validateLoop = (loop: unknown) => {
	if (typeof loop === 'undefined') {
		return;
	}

	if (typeof loop !== 'boolean') {
		throw new TypeError(
			`The "loop" prop must be a boolean or undefined, but is "${JSON.stringify(
				loop,
			)}"`,
		);
	}
};
