export const fetchRemote = async ({
	url,
	onProgress,
}: {
	url: string;
	onProgress: (progress: number) => void;
}) => {
	//  start the fetch
	const response = await fetch(url, {method: 'get'});
	if (!response.ok || !response.body) {
		throw new Error(`failed to fetch: ${url}`);
	}

	const contentLength = response.headers.get('content-length') as string;
	//  hugging face servers do include this header
	const total = parseInt(contentLength, 10);
	const reader = response.body.getReader();

	const chunks: Uint8Array[] = [];
	let receivedLength = 0;
	let progressLast = -1;

	while (true) {
		const {done, value} = await reader.read();

		if (done) {
			break;
		}

		chunks.push(value);
		receivedLength += value.length;

		if (contentLength) {
			const progressPercentage = Math.round((receivedLength / total) * 100);
			onProgress(progressPercentage);

			const progressCur = Math.round((receivedLength / total) * 10);
			if (progressCur !== progressLast) {
				progressLast = progressCur;
			}
		}
	}

	let position = 0;
	const chunksAll = new Uint8Array(receivedLength);

	for (const chunk of chunks) {
		chunksAll.set(chunk, position);
		position += chunk.length;
	}

	return chunksAll;
};
