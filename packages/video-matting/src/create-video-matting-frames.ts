import {CanvasSink, CanvasSource} from 'mediabunny';
import type {InputVideoTrack, Quality, VideoSource} from 'mediabunny';
import type {
	VideoMattingImageSource,
	VideoMattingPipelineResult,
} from './load-video-matting-model';
import {
	createVideoMattingCanvas,
	drawForegroundFrame,
	drawOpaqueBaseFrame,
	getVideoMattingCanvasContext,
} from './video-matting-canvas';

export type VideoMattingFrame = {
	image: VideoMattingImageSource;
	timestamp: number;
	duration: number;
};

export type VideoMattingFramesOptions = {
	videoTrack: InputVideoTrack;
	width: number;
	height: number;
	videoQuality: Quality;
	keyframeIntervalInSeconds: number;
	videoStartTimestamp: number;
	videoEndTimestamp: number;
};

export type VideoMattingFrames = {
	frames: AsyncGenerator<VideoMattingFrame, void, unknown>;
	baseSource: VideoSource;
	foregroundSource: VideoSource;
	addFrame: (options: {
		frame: VideoMattingFrame;
		foreground: VideoMattingPipelineResult;
		timestamp: number;
		duration: number;
	}) => Promise<void>;
};

export const createVideoMattingFrames = async (
	options: VideoMattingFramesOptions,
): Promise<VideoMattingFrames> => {
	if (
		typeof window === 'undefined' &&
		typeof process !== 'undefined' &&
		process.release?.name === 'node'
	) {
		const {createNodeVideoMattingFrames} =
			await import('./node-video-matting-frames');
		return createNodeVideoMattingFrames(options);
	}

	const {
		videoTrack,
		width,
		height,
		videoQuality,
		keyframeIntervalInSeconds,
		videoStartTimestamp,
		videoEndTimestamp,
	} = options;
	const sink = new CanvasSink(videoTrack, {
		alpha: true,
		width,
		height,
		fit: 'fill',
		poolSize: 1,
	});
	const baseCanvas = createVideoMattingCanvas({width, height});
	const foregroundCanvas = createVideoMattingCanvas({width, height});
	const baseContext = getVideoMattingCanvasContext(baseCanvas);
	const foregroundContext = getVideoMattingCanvasContext(foregroundCanvas);
	const baseSource = new CanvasSource(baseCanvas, {
		codec: 'vp9',
		quality: videoQuality,
		keyFrameInterval: keyframeIntervalInSeconds,
		alpha: 'discard',
	});
	const foregroundSource = new CanvasSource(foregroundCanvas, {
		codec: 'vp9',
		quality: videoQuality,
		keyFrameInterval: keyframeIntervalInSeconds,
		alpha: 'keep',
	});

	return {
		frames: (async function* () {
			for await (const frame of sink.canvases(
				videoStartTimestamp,
				videoEndTimestamp,
			)) {
				yield {
					image: frame.canvas,
					timestamp: frame.timestamp,
					duration: frame.duration,
				};
			}
		})(),
		baseSource,
		foregroundSource,
		addFrame: async ({frame, foreground, timestamp, duration}) => {
			if ('data' in frame.image) {
				throw new Error('Expected a canvas frame.');
			}

			drawOpaqueBaseFrame({
				context: baseContext,
				source: frame.image,
				width,
				height,
			});
			drawForegroundFrame({
				context: foregroundContext,
				result: foreground,
				source: frame.image,
				targetWidth: width,
				targetHeight: height,
			});
			await Promise.all([
				baseSource.add(timestamp, duration),
				foregroundSource.add(timestamp, duration),
			]);
		},
	};
};
