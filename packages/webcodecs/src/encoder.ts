export const createEncoder = ({
	width,
	height,
	onChunk,
}: {
	width: number;
	height: number;
	onChunk: (chunk: EncodedVideoChunk) => Promise<void>;
}) => {
	if (typeof VideoEncoder === 'undefined') {
		return null;
	}

	const encoder = new VideoEncoder({
		error(error) {
			console.error(error);
		},
		async output(chunk) {
			await onChunk(chunk);
		},
	});

	// TODO: Enable hardware acceleration if possible
	encoder.configure({
		codec: 'vp8',
		height,
		width,
	});

	return {
		encodeFrame: (_frame: VideoFrame) => {
			encoder.encode(_frame);
		},
	};
};
