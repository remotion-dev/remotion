export const fetchRemote = async ({
	url,
	onProgress,
	expectedLength,
}: {
	url: string;
	onProgress: (progress: number) => void;
	expectedLength: number;
}) => {
	//  start the fetch
	const response = await fetch(url, {method: 'get'});
	if (!response.ok || !response.body) {
		throw new Error(`failed to fetch: ${url}`);
	}

	const contentLength = response.headers.get('content-length') as string;
	//  hugging face servers do include this header
	const total = parseInt(contentLength, 10);
	if (total !== expectedLength) {
		throw new Error(
			`Content-Length header is ${total} for ${url} but expected ${expectedLength}`,
		);
	}

	const reader = response.body.getReader();

	const chunks: Uint8Array[] = [];
	let receivedLength = 0;

	while (true) {
		const {done, value} = await reader.read();

		if (done) {
			break;
		}

		chunks.push(value);
		receivedLength += value.length;

		onProgress(receivedLength);
	}

	let position = 0;
	const chunksAll = new Uint8Array(receivedLength);

	for (const chunk of chunks) {
		chunksAll.set(chunk, position);
		position += chunk.length;
	}

	return chunksAll;
};
