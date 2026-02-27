import type {VideoSample} from 'mediabunny';
import {
	ALL_FORMATS,
	Input,
	InputDisposedError,
	UrlSource,
	VideoSampleSink,
} from 'mediabunny';

type Options = {
	track: {width: number; height: number};
	container: string;
	durationInSeconds: number | null;
};

export type ExtractFramesTimestampsInSecondsFn = (
	options: Options,
) => Promise<number[]> | number[];

export type ExtractFramesProps = {
	src: string;
	timestampsInSeconds: number[] | ExtractFramesTimestampsInSecondsFn;
	onVideoSample: (sample: VideoSample) => void;
	signal?: AbortSignal;
};

export async function extractFrames({
	src,
	timestampsInSeconds,
	onVideoSample,
	signal,
}: ExtractFramesProps): Promise<void> {
	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(src),
	});

	const dispose = () => {
		input.dispose();
	};

	if (signal) {
		signal.addEventListener('abort', dispose, {once: true});
	}

	try {
		const [durationInSeconds, format, videoTrack] = await Promise.all([
			input.computeDuration(),
			input.getFormat(),
			input.getPrimaryVideoTrack(),
		]);
		if (!videoTrack) {
			throw new Error('No video track found in the input');
		}

		const timestamps =
			typeof timestampsInSeconds === 'function'
				? await timestampsInSeconds({
						track: {
							width: videoTrack.displayWidth,
							height: videoTrack.displayHeight,
						},
						container: format.name,
						durationInSeconds,
					})
				: timestampsInSeconds;

		if (timestamps.length === 0) {
			return;
		}

		const sink = new VideoSampleSink(videoTrack);
		const sampleIterator = sink.samplesAtTimestamps(timestamps);

		try {
			for await (const videoSample of sampleIterator) {
				if (signal?.aborted) {
					videoSample?.close();
					break;
				}

				if (!videoSample) {
					continue;
				}

				onVideoSample(videoSample);
			}
		} finally {
			// When input.dispose() causes the iterator to throw
			// InputDisposedError, for-await does not call .return() on the
			// iterator (it only does so on `break`). Explicitly call it so
			// the iterator can close any internally buffered VideoSamples.
			try {
				await sampleIterator.return?.();
			} catch {
				// Iterator already done or input disposed
			}
		}
	} catch (error) {
		if (error instanceof InputDisposedError) {
			return;
		}

		throw error;
	} finally {
		dispose();
		if (signal) {
			signal.removeEventListener('abort', dispose);
		}
	}
}
