import {
	ALL_FORMATS,
	Input,
	InputDisposedError,
	UrlSource,
	VideoSampleSink,
} from 'mediabunny';

export type ExtractFramesTimestampsInSecondsFn = (options: {
	track: {width: number; height: number};
	container: string;
	durationInSeconds: number | null;
}) => Promise<number[]> | number[];

export type ExtractFramesProps = {
	src: string;
	timestampsInSeconds: number[] | ExtractFramesTimestampsInSecondsFn;
	onFrame: (frame: VideoFrame) => void;
	signal?: AbortSignal;
};

export async function extractFrames({
	src,
	timestampsInSeconds,
	onFrame,
	signal,
}: ExtractFramesProps): Promise<void> {
	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(src),
	});

	if (signal) {
		signal.addEventListener(
			'abort',
			() => {
				input.dispose();
			},
			{once: true},
		);
	}

	try {
		const videoTrack = await input.getPrimaryVideoTrack();
		if (!videoTrack) {
			throw new Error('No video track found in the input');
		}

		const [durationInSeconds, format] = await Promise.all([
			input.computeDuration(),
			input.getFormat(),
		]);

		const timestamps =
			typeof timestampsInSeconds === 'function'
				? await timestampsInSeconds({
						track: {
							width: videoTrack.codedWidth,
							height: videoTrack.codedHeight,
						},
						container: format.name,
						durationInSeconds,
					})
				: timestampsInSeconds;

		if (timestamps.length === 0) {
			return;
		}

		const sink = new VideoSampleSink(videoTrack);

		for await (const videoSample of sink.samplesAtTimestamps(timestamps)) {
			if (signal?.aborted) {
				break;
			}

			if (!videoSample) {
				continue;
			}

			const videoFrame = videoSample.toVideoFrame();

			onFrame(videoFrame);
		}
	} catch (error) {
		if (error instanceof InputDisposedError) {
			return;
		}

		throw error;
	} finally {
		input.dispose();
	}
}
