import {
	hasBeenAborted,
	mediaParserController,
	parseMedia,
} from '@remotion/media-parser';
import {createAudioDecoder} from '@remotion/webcodecs';

export const getPartialAudioData = async ({
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

	// Abort if the signal is already aborted
	if (signal.aborted) {
		throw new Error('Operation was aborted');
	}

	// Forward abort signal immediately to the controller
	const onAbort = () => {
		controller.abort();
	};

	signal.addEventListener('abort', onAbort, {once: true});

	try {
		if (fromSeconds > 0) {
			controller.seek(fromSeconds);
		}

		await parseMedia({
			acknowledgeRemotionLicense: true,
			src,
			controller,
			onAudioTrack: ({track}) => {
				// Check abort signal immediately when onAudioTrack is called
				if (signal.aborted) {
					return null;
				}

				const audioDecoder = createAudioDecoder({
					track,
					onFrame: (sample) => {
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
					onError(error) {
						throw error;
					},
				});

				// The abort listener is already set up above, no need to duplicate

				return async (sample) => {
					if (signal.aborted) {
						audioDecoder.close();
						controller.abort();
						return;
					}

					if (!audioDecoder) {
						throw new Error('No audio decoder found');
					}

					// Convert timestamp using the track's timescale
					const time = sample.timestamp / track.timescale;

					// Skip samples that are before our requested start time
					if (time < fromSeconds) {
						return;
					}

					// Stop immediately when we reach our target time
					if (time >= toSeconds) {
						// wait until decoder is done
						await audioDecoder.flush();
						audioDecoder.close();
						controller.abort();
						return;
					}

					await audioDecoder.waitForQueueToBeLessThan(10);
					// we're waiting for the queue above anyway, enqueue in sync mode
					audioDecoder.decode(sample);
				};
			},
		});
	} catch (err) {
		const isAbortedByTimeCutoff = hasBeenAborted(err);

		// Don't throw if we stopped the parsing ourselves
		if (!isAbortedByTimeCutoff && !signal.aborted) {
			throw err;
		}
	} finally {
		// Clean up the event listener
		signal.removeEventListener('abort', onAbort);
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
