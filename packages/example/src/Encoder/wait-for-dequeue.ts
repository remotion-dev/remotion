export const waitForDequeue = async (decoder: VideoDecoder) => {
	if (decoder.decodeQueueSize < 10) {
		return;
	}

	let resolve = () => {};

	const cb = () => {
		resolve();
	};

	await new Promise<void>((r) => {
		resolve = r;
		decoder.addEventListener('dequeue', cb);
	});
	decoder.removeEventListener('dequeue', cb);
};

export const waitForEncoderDequeue = async (decoder: VideoEncoder) => {
	if (decoder.encodeQueueSize < 10) {
		return;
	}

	let resolve = () => {};

	const cb = () => {
		resolve();
	};

	await new Promise<void>((r) => {
		resolve = r;
		decoder.addEventListener('dequeue', cb);
	});
	decoder.removeEventListener('dequeue', cb);
};
