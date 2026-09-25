import {WHISPER_WEBGPU_SAMPLE_RATE} from '@remotion/whisper-webgpu';
import {
	ALL_FORMATS,
	Conversion,
	Input,
	NullTarget,
	Output,
	UrlSource,
	WavOutputFormat,
} from 'mediabunny';

export const resampleMediaTo16Khz = async ({
	src,
	audioStreamIndex,
	requestInit,
	onProgress,
	signal,
}: {
	readonly src: string;
	readonly audioStreamIndex: number | null;
	readonly requestInit: Omit<RequestInit, 'signal'> | null;
	readonly onProgress: (progress: number) => void;
	readonly signal: AbortSignal;
}): Promise<Float32Array> => {
	signal.throwIfAborted();
	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(src, requestInit === null ? {} : {requestInit}),
	});
	const waveformChunks: Array<{
		readonly startFrame: number;
		readonly waveform: Float32Array;
	}> = [];
	let conversion: Conversion | null = null;
	let cancellation: Promise<void> | null = null;
	const onAbort = () => {
		cancellation = conversion?.cancel().catch(() => undefined) ?? null;
		input.dispose();
	};

	signal.addEventListener('abort', onAbort, {once: true});

	try {
		onProgress(0);
		const audioTracks = await input.getAudioTracks();
		const primaryVideoTrack =
			audioStreamIndex === null ? await input.getPrimaryVideoTrack() : null;
		const audioTrack =
			audioStreamIndex !== null
				? (audioTracks[audioStreamIndex] ?? null)
				: primaryVideoTrack
					? await primaryVideoTrack.getPrimaryPairableAudioTrack()
					: (audioTracks[0] ?? null);
		if (audioTrack === null) {
			throw new Error('The selected media does not have an audio track.');
		}

		if (await audioTrack.isLive()) {
			throw new Error('Live media cannot be transcribed.');
		}

		const output = new Output({
			format: new WavOutputFormat(),
			target: new NullTarget(),
		});
		signal.throwIfAborted();
		conversion = await Conversion.init({
			input,
			output,
			tracks: 'all',
			video: {discard: true},
			audio: (track) => {
				if (track.id !== audioTrack.id) {
					return {discard: true};
				}

				return {
					codec: 'pcm-f32',
					forceTranscode: true,
					numberOfChannels: 1,
					process: (sample) => {
						signal.throwIfAborted();
						const floats = new Float32Array(
							sample.allocationSize({format: 'f32', planeIndex: 0}) /
								Float32Array.BYTES_PER_ELEMENT,
						);
						sample.copyTo(floats, {format: 'f32', planeIndex: 0});
						waveformChunks.push({
							startFrame: Math.round(
								sample.timestamp * WHISPER_WEBGPU_SAMPLE_RATE,
							),
							waveform: floats,
						});
						return sample;
					},
					sampleFormat: 'f32',
					sampleRate: WHISPER_WEBGPU_SAMPLE_RATE,
				};
			},
		});

		signal.throwIfAborted();
		if (!conversion.isValid) {
			throw new Error(
				'The audio track cannot be decoded in this browser. Try converting the media to WAV first.',
			);
		}

		conversion.onProgress = (progress) => onProgress(progress);
		await conversion.execute();
		signal.throwIfAborted();
		onProgress(1);
	} finally {
		signal.removeEventListener('abort', onAbort);
		await cancellation;
		if (signal.aborted && conversion && cancellation === null) {
			await conversion.cancel().catch(() => undefined);
		}

		input.dispose();
	}

	const waveformLength = waveformChunks.reduce(
		(maximum, chunk) =>
			Math.max(maximum, chunk.startFrame + chunk.waveform.length),
		0,
	);
	const waveform = new Float32Array(waveformLength);
	for (const chunk of waveformChunks) {
		const destinationStart = Math.max(0, chunk.startFrame);
		const sourceStart = Math.max(0, -chunk.startFrame);
		const availableLength = Math.min(
			chunk.waveform.length - sourceStart,
			waveform.length - destinationStart,
		);
		if (availableLength > 0) {
			waveform.set(
				chunk.waveform.subarray(sourceStart, sourceStart + availableLength),
				destinationStart,
			);
		}
	}

	return waveform;
};
