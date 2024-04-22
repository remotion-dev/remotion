export const handleUploadFile = async (file: File, assetPath: string) => {
	const url = new URL('/api/add-asset', window.location.origin);
	url.search = new URLSearchParams({
		folder: assetPath,
		file: file.name,
	}).toString();

	const response = await fetch(url, {
		method: 'POST',
		body: file,
	});

	if (!response.ok) {
		const jsonResponse = await response.json();
		throw new Error(jsonResponse.error);
	}
};
