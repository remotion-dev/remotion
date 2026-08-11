export const normalizeServeUrl = (unnormalized: string): string => {
	const hasQuery = unnormalized.includes('?');

	if (hasQuery) {
		return normalizeServeUrl(unnormalized.substr(0, unnormalized.indexOf('?')));
	}

	const endsInIndexHtml = unnormalized.endsWith('index.html');
	if (endsInIndexHtml) {
		return unnormalized;
	}

	// Ends with slash

	if (unnormalized.endsWith('/')) {
		return `${unnormalized}index.html`;
	}

	return `${unnormalized}/index.html`;
};
