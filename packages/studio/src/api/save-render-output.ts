import {
	STUDIO_CSRF_HEADER,
	type CompletedClientRender,
} from '@remotion/studio-shared';
import {callApi} from '../components/call-api';

const throwIfNotOk = async (response: Response): Promise<void> => {
	if (!response.ok) {
		try {
			const jsonResponse = await response.json();
			throw new Error(jsonResponse.error);
		} catch (parseError) {
			if (parseError instanceof Error && parseError.message) {
				throw parseError;
			}

			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}
	}
};

export const saveOutputFile = async ({
	blob,
	filePath,
}: {
	blob: Blob;
	filePath: string;
}): Promise<void> => {
	const url = new URL('/api/upload-output', window.location.origin);
	url.search = new URLSearchParams({filePath}).toString();

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			[STUDIO_CSRF_HEADER]: window.remotion_studioCsrfToken ?? '',
		},
		body: blob,
	});

	await throwIfNotOk(response);
};

export const registerClientRender = async (
	render: CompletedClientRender,
): Promise<void> => {
	await callApi('/api/register-client-render', render);
};

export const unregisterClientRender = async (id: string): Promise<void> => {
	await callApi('/api/unregister-client-render', {id});
};
