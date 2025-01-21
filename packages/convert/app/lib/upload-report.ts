export const handleDrop = async (file: File) => {
	const presignedResponse = await fetch('https://www.remotion.pro/api/upload', {
		method: 'POST',
		body: JSON.stringify({
			size: file.size,
			contentType: file.type,
		}),
		headers: {
			'content-type': 'application/json',
		},
	});
	const json = await presignedResponse.json();
	console.log(json);
};
