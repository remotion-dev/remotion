import {isFirefox} from './browser-quirks';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';

export const needsToCorrectVideoFrame = ({
	videoFrame,
	outputCodec,
}: {
	videoFrame: VideoFrame;
	outputCodec: ConvertMediaVideoCodec;
}): boolean => {
	// On Chrome when dropping a vertical iPhone video
	if (videoFrame.format === null) {
		return true;
	}

	return isFirefox() && videoFrame.format === 'BGRX' && outputCodec === 'h264';
};

export const convertToCorrectVideoFrame = ({
	videoFrame,
	outputCodec,
}: {
	videoFrame: VideoFrame;
	outputCodec: ConvertMediaVideoCodec;
}): VideoFrame => {
	if (!needsToCorrectVideoFrame({videoFrame, outputCodec})) {
		return videoFrame;
	}

	const canvas = new OffscreenCanvas(
		videoFrame.displayWidth,
		videoFrame.displayHeight,
	);

	canvas.width = videoFrame.displayWidth;
	canvas.height = videoFrame.displayHeight;

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Could not get 2d context');
	}

	ctx.drawImage(videoFrame, 0, 0);

	return new VideoFrame(canvas, {
		displayHeight: videoFrame.displayHeight,
		displayWidth: videoFrame.displayWidth,
		duration: videoFrame.duration as number,
		timestamp: videoFrame.timestamp,
	});
};
