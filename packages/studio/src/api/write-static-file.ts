export const writeStaticFile = async ({
	contents,
	filePath,
}: {
	contents: Buffer | ArrayBuffer;
	filePath: string;
}): Promise<void> => {
	const url = new URL('/api/add-asset', window.location.origin);

	url.search = new URLSearchParams({
		filePath: [filePath].filter(Boolean).join('/'),
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
