export const createEncoder = ({
	width,
	height,
}: {
	width: number;
	height: number;
}) => {
	if (typeof VideoEncoder === 'undefined') {
		return null;
	}

	const encoder = new VideoEncoder({
		error(error) {
			console.error(error);
		},
		output(chunk, metadata) {
			console.log(
				'encoded as vp8',
				chunk,
				chunk,
				metadata?.decoderConfig?.colorSpace?.matrix,
			);
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
