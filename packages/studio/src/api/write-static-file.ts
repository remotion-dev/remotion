export const writeStaticFile = async ({
	contents,
	filePath,
}: {
	contents: string | ArrayBuffer;
	filePath: string;
}): Promise<void> => {
	const url = new URL('/api/add-asset', window.location.origin);

	if (filePath.includes('\\')) {
		return Promise.reject(new Error('File path cannot contain backslashes'));
	}

	url.search = new URLSearchParams({
		filePath,
	}).toString();

	const response = await fetch(url, {
		method: 'POST',
		body: contents,
	});

	if (!response.ok) {
		const jsonResponse = await response.json();
		throw new Error(jsonResponse.error);
	}
};
