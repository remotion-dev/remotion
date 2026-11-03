import type {CompletedClientRender} from '@remotion/studio-shared';
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
	artifact,
}: {
	blob: Blob;
	filePath: string;
	artifact: {compositionId: string; outputName: string} | null;
}): Promise<void> => {
	const url = new URL('/api/upload-output', window.location.origin);
	url.searchParams.set('filePath', filePath);
	if (artifact) {
		url.searchParams.set('artifactCompositionId', artifact.compositionId);
		url.searchParams.set('outputName', artifact.outputName);
	}

	const response = await fetch(url, {
		method: 'POST',
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
