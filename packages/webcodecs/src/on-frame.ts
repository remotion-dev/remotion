import type {VideoTrack} from '@remotion/media-parser';
import {isSafari} from './browser-quirks';
import type {ConvertMediaOnVideoFrame} from './convert-media';
import {convertToCorrectVideoFrame} from './convert-to-correct-videoframe';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';
import type {ResizeOperation} from './resizing/mode';
import {rotateAndResizeVideoFrame} from './rotate-and-resize-video-frame';
import type {WebCodecsVideoEncoder} from './video-encoder';

export const onFrame = async ({
	frame: unrotatedFrame,
	onVideoFrame,
	videoEncoder,
	track,
	outputCodec,
	rotation,
	resizeOperation,
}: {
	frame: VideoFrame;
	onVideoFrame: ConvertMediaOnVideoFrame | null;
	videoEncoder: WebCodecsVideoEncoder;
	track: VideoTrack;
	outputCodec: ConvertMediaVideoCodec;
	rotation: number;
	resizeOperation: ResizeOperation | null;
}) => {
	const rotated = rotateAndResizeVideoFrame({
		rotation,
		frame: unrotatedFrame,
		resizeOperation,
		videoCodec: outputCodec,
	});
	if (unrotatedFrame !== rotated) {
		unrotatedFrame.close();
	}

	const userProcessedFrame = onVideoFrame
		? await onVideoFrame({frame: rotated, track})
		: rotated;

	if (userProcessedFrame.displayWidth !== rotated.displayWidth) {
		throw new Error(
			`Returned VideoFrame of track ${track.trackId} has different displayWidth (${userProcessedFrame.displayWidth}) than the input frame (${userProcessedFrame.displayHeight})`,
		);
	}

	if (userProcessedFrame.displayHeight !== rotated.displayHeight) {
		throw new Error(
			`Returned VideoFrame of track ${track.trackId} has different displayHeight (${userProcessedFrame.displayHeight}) than the input frame (${userProcessedFrame.displayHeight})`,
		);
	}

	// In Safari, calling new VideoFrame() might change the timestamp
	// In flipVideo test from 803000 to 803299
	if (userProcessedFrame.timestamp !== rotated.timestamp && !isSafari()) {
		throw new Error(
			`Returned VideoFrame of track ${track.trackId} has different timestamp (${userProcessedFrame.timestamp}) than the input frame (${rotated.timestamp}). When calling new VideoFrame(), pass {timestamp: frame.timestamp} as second argument`,
		);
	}

	if ((userProcessedFrame.duration ?? 0) !== (rotated.duration ?? 0)) {
		throw new Error(
			`Returned VideoFrame of track ${track.trackId} has different duration (${userProcessedFrame.duration}) than the input frame (${rotated.duration}). When calling new VideoFrame(), pass {duration: frame.duration} as second argument`,
		);
	}

	const fixedFrame = convertToCorrectVideoFrame({
		videoFrame: userProcessedFrame,
		outputCodec,
	});

	await videoEncoder.encodeFrame(fixedFrame, fixedFrame.timestamp);

	fixedFrame.close();
	if (rotated !== userProcessedFrame) {
		rotated.close();
	}

	if (fixedFrame !== userProcessedFrame) {
		fixedFrame.close();
	}
};
