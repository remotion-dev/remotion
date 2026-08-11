export const fetchWithCorsCatch = async (src: string, init?: RequestInit) => {
	try {
		const response = await fetch(src, {
			mode: 'cors',
			referrerPolicy: 'no-referrer-when-downgrade',
			...init,
		});
		return response;
	} catch (err) {
		const error = err as Error;
		if (
			// Chrome
			error.message.includes('Failed to fetch') ||
			// Safari
			error.message.includes('Load failed') ||
			// Firefox
			error.message.includes('NetworkError when attempting to fetch resource')
		) {
			throw new TypeError(
				`Failed to read from ${src}: ${error.message}. Does the resource support CORS?`,
			);
		}

		throw err;
	}
};
