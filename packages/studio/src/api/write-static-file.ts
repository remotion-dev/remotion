import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';

export const writeStaticFile = async ({
	contents,
	filePath,
}: {
	contents: string | ArrayBuffer;
	filePath: string;
}): Promise<void> => {
	if (filePath.includes('\\')) {
		return Promise.reject(new Error('File path cannot contain backslashes'));
	}

	const browserStudioOperations = getBrowserStudioOperations();
	if (browserStudioOperations) {
		return browserStudioOperations.writeStaticFile({contents, filePath});
	}

	if (window.remotion_isReadOnlyStudio) {
		throw new Error('writeStaticFile() is not available in read-only Studio');
	}

	const url = new URL(
		`${window.remotion_staticBase}/api/add-asset`,
		window.location.origin,
	);

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
