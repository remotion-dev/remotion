import type {CompletedClientRender} from '@remotion/studio-shared';

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
		body: blob,
	});

	if (!response.ok) {
		const jsonResponse = await response.json();
		throw new Error(jsonResponse.error);
	}
};

export const registerClientRender = async (
	render: CompletedClientRender,
): Promise<void> => {
	const response = await fetch('/api/register-client-render', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(render),
	});

	if (!response.ok) {
		const jsonResponse = await response.json();
		throw new Error(jsonResponse.error);
	}
};

export const unregisterClientRender = async (id: string): Promise<void> => {
	const response = await fetch('/api/unregister-client-render', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({id}),
	});

	if (!response.ok) {
		const jsonResponse = await response.json();
		throw new Error(jsonResponse.error);
	}
};
