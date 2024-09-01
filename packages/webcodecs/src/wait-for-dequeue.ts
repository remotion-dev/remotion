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

export const decoderWaitForFinish = async (
	videoDecoder: VideoDecoder | AudioDecoder,
) => {
	while (videoDecoder.decodeQueueSize > 0) {
		await new Promise<void>((r) => {
			// @ts-expect-error exists
			videoDecoder.addEventListener('dequeue', () => r(), {
				once: true,
			});
		});
	}
};

// Queue goes way higher but this will eat more memory right?
// But if not done this way, quality is worse
export const encoderWaitForDequeue = async (
	videoEncoder: VideoEncoder | AudioEncoder,
) => {
	while (videoEncoder.encodeQueueSize > 10) {
		await new Promise<void>((r) => {
			// @ts-expect-error exists
			videoEncoder.addEventListener('dequeue', () => r(), {
				once: true,
			});
		});
	}
};

export const encoderWaitForFinish = async (
	videoEncoder: VideoEncoder | AudioEncoder,
) => {
	while (videoEncoder.encodeQueueSize > 0) {
		await new Promise<void>((r) => {
			// @ts-expect-error exists
			videoEncoder.addEventListener('dequeue', () => r(), {
				once: true,
			});
		});
	}
};
