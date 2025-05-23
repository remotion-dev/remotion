import {
	hasBeenAborted,
	mediaParserController,
	parseMedia,
} from '@remotion/media-parser';

export const getPartialMediaData = async ({
	src,
	fromSeconds,
	toSeconds,
	channelIndex,
	signal,
}: {
	src: string;
	fromSeconds: number;
	toSeconds: number;
	channelIndex: number;
	signal: AbortSignal;
}): Promise<Float32Array> => {
	const controller = mediaParserController();

	// Collect audio samples
	const audioSamples: Float32Array[] = [];
	// Create AudioDecoder
	const audioDecoder = new AudioDecoder({
		output: (sample) => {
			if (signal.aborted) {
				sample.close();
				return;
			}

			// For multi-channel audio, we need to handle channels properly
			const {numberOfChannels} = sample;
			const samplesPerChannel = sample.numberOfFrames;

			let data: Float32Array;

			if (numberOfChannels === 1) {
				// Mono audio
				data = new Float32Array(
					sample.allocationSize({format: 'f32', planeIndex: 0}),
				);
				sample.copyTo(data, {format: 'f32', planeIndex: 0});
			} else {
				// Multi-channel audio: extract specific channel
				const allChannelsData = new Float32Array(
					sample.allocationSize({format: 'f32', planeIndex: 0}),
				);
				sample.copyTo(allChannelsData, {format: 'f32', planeIndex: 0});

				// Extract the specific channel (interleaved audio)
				data = new Float32Array(samplesPerChannel);
				for (let i = 0; i < samplesPerChannel; i++) {
					data[i] = allChannelsData[i * numberOfChannels + channelIndex];
				}
			}

			audioSamples.push(data);
			sample.close();
		},
		error: (error) => {
			throw error;
		},
	});

	// Abort if the signal is already aborted
	if (signal.aborted) {
		throw new Error('Operation was aborted');
	}

	// Listen for abort signal
	const onAbort = () => {
		controller.abort();
		if (audioDecoder) {
			audioDecoder.close();
		}
	};

	signal.addEventListener('abort', onAbort, {once: true});

	try {
		controller.seek(fromSeconds);

		await parseMedia({
			src,
			controller,
			onAudioTrack: ({track}) => {
				// Configure the decoder with the track from the callback
				audioDecoder.configure(track);

				return (sample) => {
					if (signal.aborted) {
						return;
					}

					// Convert timestamp using the track's timescale
					const time = sample.timestamp / track.timescale;

					// Stop immediately when we reach our target time
					if (time >= toSeconds) {
						controller.abort();
						audioDecoder.flush();
						return;
					}

					// Decode the sample using the sample directly
					audioDecoder.decode(new EncodedAudioChunk(sample));
				};
			},
		});
	} catch (err) {
		// Don't throw if we stopped the parsing ourselves
		if (!hasBeenAborted(err) && !signal.aborted) {
			throw err;
		}
	} finally {
		signal.removeEventListener('abort', onAbort);
		if (audioDecoder) {
			try {
				await audioDecoder.flush();
				audioDecoder.close();
			} catch {
				// Ignore errors during cleanup
			}
		}
	}

	// Simply concatenate all audio data since windowing handles the time ranges
	const totalSamples = audioSamples.reduce(
		(sum, sample) => sum + sample.length,
		0,
	);
	const result = new Float32Array(totalSamples);

	let offset = 0;
	for (const audioSample of audioSamples) {
		result.set(audioSample, offset);
		offset += audioSample.length;
	}

	return result;
};
