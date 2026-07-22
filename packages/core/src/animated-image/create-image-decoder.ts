export const createImageDecoder = async ({
	resolvedSrc,
	signal,
	requestInit,
	contentType,
}: {
	resolvedSrc: string;
	signal: AbortSignal;
	requestInit?: RequestInit;
	contentType: string | null;
}) => {
	if (typeof ImageDecoder === 'undefined') {
		throw new Error(
			'Your browser does not support the WebCodecs ImageDecoder API.',
		);
	}

	const response = await fetch(resolvedSrc, {...requestInit, signal});
	const {body} = response;
	if (!body) {
		throw new Error('Got no body');
	}

	const decoder = new ImageDecoder({
		data: body,
		type: contentType ?? response.headers.get('Content-Type') ?? 'image/gif',
	});
	await Promise.all([decoder.completed, decoder.tracks.ready]);

	const {selectedTrack} = decoder.tracks;
	if (!selectedTrack) {
		decoder.close();
		throw new Error('No selected track');
	}

	return {decoder, selectedTrack};
};
