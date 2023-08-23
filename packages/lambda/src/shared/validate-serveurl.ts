export const validateServeUrl = (serveUrl: unknown) => {
	if (typeof serveUrl !== 'string') {
		throw new TypeError(
			`"serveURL" parameter must be a string, but is ${JSON.stringify(
				serveUrl,
			)}`,
		);
	}
};
