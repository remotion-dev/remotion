import {DOCS_URL} from './docs-url';

export const convertToServeUrl = ({
	urlOrId,
	bucketName,
}: {
	urlOrId: string;
	bucketName: string;
}) => {
	if (urlOrId.startsWith('src/')) {
		throw new Error(
			`Remotion Lambda can only render based on a URL in the cloud. It seems like you passed a local file: ${urlOrId}. Read the setup guide for Remotion Lambda ${DOCS_URL}/docs/cloudrun/setup`,
		);
	}

	if (urlOrId.startsWith('http://') || urlOrId.startsWith('https://')) {
		return urlOrId;
	}

	return `https://storage.googleapis.com/${bucketName}/sites/${urlOrId}/index.html`;
};
