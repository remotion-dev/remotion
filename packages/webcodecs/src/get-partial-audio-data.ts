import {
	hasBeenAborted,
	mediaParserController,
	parseMedia,
} from '@remotion/media-parser';
import {createAudioDecoder} from './create-audio-decoder';

/**
 * Extract the portion of an audio chunk that overlaps with the requested time window
 */
const extractOverlappingAudioSamples = ({
	sample,
	fromSeconds,
	toSeconds,
	channelIndex,
	timescale,
}: {
	sample: AudioData;
	fromSeconds: number;
	toSeconds: number;
	channelIndex: number;
	timescale: number;
}): Float32Array | null => {
	const chunkStartInSeconds = sample.timestamp / timescale;
	const chunkDuration = sample.numberOfFrames / sample.sampleRate;
	const chunkEndInSeconds = chunkStartInSeconds + chunkDuration;

	// Calculate overlap with the requested window
	const overlapStartSecond = Math.max(chunkStartInSeconds, fromSeconds);
	const overlapEndSecond = Math.min(chunkEndInSeconds, toSeconds);

	// Skip if no overlap with requested window
	if (overlapStartSecond >= overlapEndSecond) {
		return null;
	}

	// For multi-channel audio, we need to handle channels properly
	const {numberOfChannels} = sample;
	const samplesPerChannel = sample.numberOfFrames;

	let data: Float32Array;

	if (numberOfChannels === 1) {
		// Mono audio
		data = new Float32Array(samplesPerChannel);
		sample.copyTo(data, {format: 'f32', planeIndex: 0});
	} else {
		// Multi-channel audio: extract specific channel
		const interleaved = new Float32Array(samplesPerChannel * numberOfChannels);
		sample.copyTo(interleaved, {format: 'f32', planeIndex: 0});

		// Extract the specific channel (interleaved audio)
		data = new Float32Array(samplesPerChannel);
		for (let i = 0; i < samplesPerChannel; i++) {
			data[i] = interleaved[i * numberOfChannels + channelIndex];
		}
	}

	// Calculate which samples to keep from this chunk
	const startSampleInChunk = Math.floor(
		(overlapStartSecond - chunkStartInSeconds) * sample.sampleRate,
	);
	const endSampleInChunk = Math.ceil(
		(overlapEndSecond - chunkStartInSeconds) * sample.sampleRate,
	);

	// Only keep the samples we need
	return data.slice(startSampleInChunk, endSampleInChunk);
};

// Small buffer to ensure we capture chunks that span across boundaries
// We need this because specified time window is not always aligned with the audio chunks
// so that we fetch a bit more, and then trim it down to the requested time window
const BUFFER_IN_SECONDS = 0.1;

export type GetPartialAudioDataProps = {
	src: string;
	fromSeconds: number;
	toSeconds: number;
	channelIndex: number;
	signal: AbortSignal;
};

export const getPartialAudioData = async ({
	src,
	fromSeconds,
	toSeconds,
	channelIndex,
	signal,
}: GetPartialAudioDataProps): Promise<Float32Array> => {
	const controller = mediaParserController();

	// Collect audio samples
	const audioSamples: Float32Array[] = [];

	// Abort if the signal is already aborted
	if (signal.aborted) {
		throw new Error('Operation was aborted');
	}

	// Forward abort signal immediately to the controller

	const {resolve: resolveAudioDecode, promise: audioDecodePromise} =
		Promise.withResolvers<void>();

	const onAbort = () => {
		controller.abort();
		resolveAudioDecode();
	};

	signal.addEventListener('abort', onAbort, {once: true});

	try {
		// expand decode window slightly to avoid gaps at boundaries
		const seekFromSeconds = Math.max(0, fromSeconds - BUFFER_IN_SECONDS);
		if (seekFromSeconds > 0) {
			controller.seek(seekFromSeconds);
		}

		await parseMedia({
			acknowledgeRemotionLicense: true,
			src,
			controller,
			onAudioTrack: async ({track}) => {
				if (signal.aborted) {
					return null;
				}

				const audioDecoder = await createAudioDecoder({
					track,
					onFrame: (sample) => {
						if (signal.aborted) {
							sample.close();
							return;
						}

						const trimmedData = extractOverlappingAudioSamples({
							sample,
							fromSeconds,
							toSeconds,
							channelIndex,
							timescale: track.timescale,
						});

						if (trimmedData) {
							audioSamples.push(trimmedData);
						}

						sample.close();
					},
					onError(error) {
						resolveAudioDecode();
						throw error;
					},
				});

				return async (sample) => {
					if (signal.aborted) {
						audioDecoder.close();
						controller.abort();
						return;
					}

					if (!audioDecoder) {
						throw new Error('No audio decoder found');
					}

					// decode a bit earlier and later than requested, trimming happens later
					const fromSecondsWithBuffer = Math.max(
						0,
						fromSeconds - BUFFER_IN_SECONDS,
					);
					const toSecondsWithBuffer = toSeconds + BUFFER_IN_SECONDS;

					// Convert timestamp using the track's timescale
					const time = sample.timestamp / track.timescale;

					// Skip samples that are before our requested start time (with buffer)
					if (time < fromSecondsWithBuffer) {
						return;
					}

					// Stop immediately when we reach our target time (with buffer)
					if (time >= toSecondsWithBuffer) {
						// wait until decoder is done
						audioDecoder.flush().then(() => {
							audioDecoder.close();
							resolveAudioDecode();
						});
						controller.abort();
						return;
					}

					await audioDecoder.waitForQueueToBeLessThan(10);
					// we're waiting for the queue above anyway, enqueue in sync mode
					audioDecoder.decode(sample);

					// this is called on the last sample of the track
					// so if we have reached the end of the track, resolve the promise
					return () => {
						audioDecoder.flush().then(() => {
							audioDecoder.close();
							resolveAudioDecode();
						});
					};
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

	await audioDecodePromise;
	// Simply concatenate all audio data since we've already trimmed each chunk
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
