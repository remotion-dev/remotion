export const decoderWaitForDequeue = async (videoDecoder: VideoDecoder) => {
	if (videoDecoder.decodeQueueSize > 10) {
		let resolve = () => {};

		const cb = () => {
			resolve();
		};

		await new Promise<void>((r) => {
			resolve = r;
			videoDecoder.addEventListener('dequeue', cb);
		});
		videoDecoder.removeEventListener('dequeue', cb);
	}
};

// TODO: This is weird
// Queue goes way higher but this will eat more memory right?
// But if not done this way, quality is worse
export const encoderWaitForDequeue = async (videoEncoder: VideoEncoder) => {
	if (videoEncoder.encodeQueueSize > 10) {
		let resolve = () => {};

		const cb = () => {
			resolve();
		};

		await new Promise<void>((r) => {
			resolve = r;
			videoEncoder.addEventListener('dequeue', cb);
		});
		videoEncoder.removeEventListener('dequeue', cb);
	}
};
