import {uploadWithProgress} from './upload-with-progress';

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
	const {presignedUrl, readUrl} = json;

	await uploadWithProgress({
		file,
		url: presignedUrl,
		onProgress: (uploadProgress) => {
			console.log(uploadProgress);
		},
	});
};
