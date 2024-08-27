export const decoderWaitForDequeue = async (
	videoDecoder: VideoDecoder | AudioDecoder,
) => {
	while (videoDecoder.decodeQueueSize > 10) {
		await new Promise<void>((r) => {
			// @ts-expect-error exists
			videoDecoder.addEventListener('dequeue', () => r(), {
				once: true,
			});
		});
	}
};

// TODO: This is weird
// Queue goes way higher but this will eat more memory right?
// But if not done this way, quality is worse
export const encoderWaitForDequeue = async (
	videoEncoder: VideoEncoder | AudioEncoder,
) => {
	if (videoEncoder.encodeQueueSize > 10) {
		let resolve = () => {};

		const cb = () => {
			resolve();
		};

		await new Promise<void>((r) => {
			resolve = r;
			// @ts-expect-error exists
			videoEncoder.addEventListener('dequeue', cb);
		});
		// @ts-expect-error exists
		videoEncoder.removeEventListener('dequeue', cb);
	}
};
