import type {VideoSample} from 'mediabunny';
import {
	ALL_FORMATS,
	Input,
	InputDisposedError,
	UrlSource,
	VideoSampleSink,
} from 'mediabunny';
import {Internals} from 'remotion';
import {clampTimestampsToDuration} from './clamp-timestamps-to-duration';
import {getDurationOrCompute} from './get-duration-or-compute';

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
	repeatLastFrame?: boolean;
};

export async function extractFrames({
	src,
	timestampsInSeconds,
	onVideoSample,
	signal,
	repeatLastFrame = false,
}: ExtractFramesProps): Promise<void> {
	const lease = Internals.globalMediaResourceManager.acquire<Input>({
		key: Internals.getMediabunnyInputResourceKey({
			src,
			credentials: null,
			requestInitFingerprint: null,
			revision: null,
		}),
		create: () => {
			const createdInput = new Input({
				formats: ALL_FORMATS,
				source: new UrlSource(src),
			});

			return {
				resource: createdInput,
				dispose: () => createdInput.dispose(),
			};
		},
	});
	const input = lease.resource;

	try {
		const [durationInSeconds, format, videoTrack] = await Promise.all([
			lease.getOrCreateValue(Internals.MEDIABUNNY_DURATION_VALUE_KEY, () =>
				getDurationOrCompute(input),
			),
			input.getFormat(),
			input.getPrimaryVideoTrack(),
		]);
		if (signal?.aborted) {
			return;
		}

		if (!videoTrack) {
			throw new Error('No video track found in the input');
		}

		if (await videoTrack.isLive()) {
			throw new Error(
				'Live streams are not currently supported by Remotion. Sorry! Source: ' +
					src,
			);
		}

		if (await videoTrack.isRelativeToUnixEpoch()) {
			throw new Error(
				'Streams with UNIX timestamps are not currently supported by Remotion. Sorry! Source: ' +
					src,
			);
		}

		const requestedTimestamps =
			typeof timestampsInSeconds === 'function'
				? await timestampsInSeconds({
						track: {
							width: await videoTrack.getDisplayWidth(),
							height: await videoTrack.getDisplayHeight(),
						},
						container: format.name,
						durationInSeconds,
					})
				: timestampsInSeconds;
		const timestamps = repeatLastFrame
			? clampTimestampsToDuration({
					timestamps: requestedTimestamps,
					durationInSeconds,
				})
			: requestedTimestamps;

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
			// When input.dispose() causes the iterator to throw InputDisposedError,
			// for-await does not call .return() on the iterator.
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
		lease.release();
	}
}
