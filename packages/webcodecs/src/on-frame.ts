import type {VideoTrack} from '@remotion/media-parser';
import type {ConvertMediaOnVideoFrame} from './convert-media';
import {convertToCorrectVideoFrame} from './convert-to-correct-videoframe';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';
import {rotateVideoFrame} from './rotate-video-frame';
import type {WebCodecsVideoEncoder} from './video-encoder';

export const onFrame = async ({
	frame: unrotatedFrame,
	onVideoFrame,
	videoEncoder,
	track,
	outputCodec,
	rotation,
}: {
	frame: VideoFrame;
	onVideoFrame: ConvertMediaOnVideoFrame | null;
	videoEncoder: WebCodecsVideoEncoder;
	track: VideoTrack;
	outputCodec: ConvertMediaVideoCodec;
	rotation: number;
}) => {
	const rotated = rotateVideoFrame({
		rotation,
		frame: unrotatedFrame,
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

	if (userProcessedFrame.timestamp !== rotated.timestamp) {
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
