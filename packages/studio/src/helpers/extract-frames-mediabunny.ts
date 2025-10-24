import {
	ALL_FORMATS,
	CanvasSink,
	Input,
	InputDisposedError,
	UrlSource,
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

		const sink = new CanvasSink(videoTrack, {
			poolSize: 1,
		});

		for await (const wrappedCanvas of sink.canvasesAtTimestamps(timestamps)) {
			if (signal?.aborted) {
				break;
			}

			if (!wrappedCanvas) {
				continue;
			}

			const videoFrame = new VideoFrame(wrappedCanvas.canvas, {
				timestamp: wrappedCanvas.timestamp * 1_000_000,
			});

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
