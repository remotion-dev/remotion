import {VideoSample, VideoSampleSink, VideoSampleSource} from 'mediabunny';
import type {
	VideoMattingFrames,
	VideoMattingFramesOptions,
} from './create-video-matting-frames';

export const createNodeVideoMattingFrames = ({
	videoTrack,
	width,
	height,
	videoQuality,
	keyframeIntervalInSeconds,
	videoStartTimestamp,
	videoEndTimestamp,
	includeBase,
}: VideoMattingFramesOptions): VideoMattingFrames => {
	const sink = new VideoSampleSink(videoTrack);
	const baseSource = includeBase
		? new VideoSampleSource({
				codec: 'vp9',
				quality: videoQuality,
				keyFrameInterval: keyframeIntervalInSeconds,
				alpha: 'discard',
			})
		: null;
	const foregroundSource = new VideoSampleSource({
		codec: 'vp9',
		quality: videoQuality,
		keyFrameInterval: keyframeIntervalInSeconds,
		alpha: 'keep',
	});

	return {
		frames: (async function* () {
			for await (const sample of sink.samples(
				videoStartTimestamp,
				videoEndTimestamp,
			)) {
				const data = new Uint8ClampedArray(width * height * 4);
				try {
					// Apply rotation and pixel aspect ratio before passing pixels to the model.
					const transformed = await sample.transform({
						width,
						height,
						fit: 'fill',
					});
					try {
						await transformed.copyTo(data, {format: 'RGBA'});
					} finally {
						transformed.close();
					}
				} finally {
					sample.close();
				}

				yield {
					image: {data, width, height, channels: 4},
					timestamp: sample.timestamp,
					duration: sample.duration,
				};
			}
		})(),
		baseSource,
		foregroundSource,
		addFrame: async ({frame, foreground, timestamp, duration}) => {
			if (!('data' in frame.image)) {
				throw new Error('Expected an RGBA frame.');
			}

			const baseData = includeBase ? frame.image.data.slice() : null;
			let foregroundData: Uint8ClampedArray<ArrayBuffer>;
			if (foreground.width === width && foreground.height === height) {
				foregroundData = foreground.data.slice();
			} else {
				foregroundData = new Uint8ClampedArray(width * height * 4);
				const foregroundSample = new VideoSample(foreground.data, {
					format: 'RGBA',
					codedWidth: foreground.width,
					codedHeight: foreground.height,
					timestamp,
					duration,
				});
				try {
					const resized = await foregroundSample.transform({
						width,
						height,
						fit: 'fill',
					});
					try {
						await resized.copyTo(foregroundData, {format: 'RGBA'});
					} finally {
						resized.close();
					}
				} finally {
					foregroundSample.close();
				}
			}

			for (let i = 0; i < foregroundData.length; i += 4) {
				const alpha = frame.image.data[i + 3]! / 255;
				// Match the browser's opaque black base and destination-in foreground.
				if (baseData) {
					baseData[i] = Math.round(baseData[i]! * alpha);
					baseData[i + 1] = Math.round(baseData[i + 1]! * alpha);
					baseData[i + 2] = Math.round(baseData[i + 2]! * alpha);
					baseData[i + 3] = 255;
				}

				foregroundData[i + 3] = Math.round(foregroundData[i + 3]! * alpha);
			}

			const base = baseData
				? new VideoSample(baseData, {
						format: 'RGBA',
						codedWidth: width,
						codedHeight: height,
						timestamp,
						duration,
					})
				: null;
			const foregroundFrame = new VideoSample(foregroundData, {
				format: 'RGBA',
				codedWidth: width,
				codedHeight: height,
				timestamp,
				duration,
			});
			try {
				const results = await Promise.allSettled([
					baseSource?.add(base!),
					foregroundSource.add(foregroundFrame),
				]);
				for (const result of results) {
					if (result.status === 'rejected') {
						throw result.reason;
					}
				}
			} finally {
				base?.close();
				foregroundFrame.close();
			}
		},
	};
};
