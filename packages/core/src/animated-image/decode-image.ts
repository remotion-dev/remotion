export type RemotionImageDecoder = {
	getFrame: (i: number) => Promise<ImageDecodeResult>;
	frameCount: number;
};

export const decodeImage = async (
	resolvedSrc: string,
	signal: AbortSignal,
): Promise<RemotionImageDecoder> => {
	if (typeof ImageDecoder === 'undefined') {
		throw new Error(
			'Your browser does not support the WebCodecs ImageDecoder API.',
		);
	}

	const res = await fetch(resolvedSrc, {signal});
	const {body} = res;

	if (!body) {
		throw new Error('Got no body');
	}

	const decoder = new ImageDecoder({
		data: body,
		type: res.headers.get('Content-Type') || 'image/gif',
	});
	await decoder.completed;
	const {selectedTrack} = decoder.tracks;
	if (!selectedTrack) {
		throw new Error('No selected track');
	}

	return {
		getFrame: async (i: number) => {
			const frame = await decoder.decode({
				frameIndex: i,
				completeFramesOnly: true,
			});
			return frame;
		},
		frameCount: selectedTrack.frameCount,
	};
};
