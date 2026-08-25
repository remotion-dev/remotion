export const WHISPER_WEBGPU_SAMPLE_RATE = 16_000;

export type ResampleTo16KhzOptions = {
	file: Blob;
	onProgress?: (progress: number) => void;
};

export const resampleTo16Khz = async ({
	file,
	onProgress,
}: ResampleTo16KhzOptions): Promise<Float32Array> => {
	if (typeof AudioContext === 'undefined') {
		throw new Error('AudioContext is not available in this environment.');
	}

	if (typeof OfflineAudioContext === 'undefined') {
		throw new Error(
			'OfflineAudioContext is not available in this environment.',
		);
	}

	if (file.size === 0) {
		throw new Error('The audio file is empty.');
	}

	onProgress?.(0);
	const arrayBuffer = await file.arrayBuffer();
	onProgress?.(0.25);

	const audioContext = new AudioContext({
		sampleRate: WHISPER_WEBGPU_SAMPLE_RATE,
	});

	try {
		const decoded = await audioContext.decodeAudioData(arrayBuffer);
		onProgress?.(0.6);
		const length = Math.max(
			1,
			Math.ceil(decoded.duration * WHISPER_WEBGPU_SAMPLE_RATE),
		);
		const offlineContext = new OfflineAudioContext(
			1,
			length,
			WHISPER_WEBGPU_SAMPLE_RATE,
		);
		const source = offlineContext.createBufferSource();
		source.buffer = decoded;
		source.connect(offlineContext.destination);
		source.start();
		const rendered = await offlineContext.startRendering();
		onProgress?.(1);
		return rendered.getChannelData(0).slice();
	} finally {
		await audioContext.close();
	}
};
