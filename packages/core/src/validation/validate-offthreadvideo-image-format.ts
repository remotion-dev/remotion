export const validateOffthreadVideoImageFormat = (input: unknown) => {
	if (typeof input === 'undefined') {
		return;
	}

	if (typeof input !== 'string') {
		throw new TypeError(
			`<OffthreadVideo imageFormat=""> must be a string, but got ${JSON.stringify(
				input
			)} instead.`
		);
	}

	if (input !== 'png' && input !== 'jpeg') {
		throw new TypeError(
			`<OffthreadVideo imageFormat=""> must be either "png" or "jpeg", but got ${input}`
		);
	}
};
