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
