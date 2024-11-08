import type {VideoTrack} from '@remotion/media-parser';
import type {
	ConvertMediaOnMediaStateUpdate,
	ConvertMediaOnVideoFrame,
	ConvertMediaState,
} from './convert-media';
import type {WebCodecsVideoEncoder} from './video-encoder';

export const onFrame = async ({
	frame,
	onVideoFrame,
	videoEncoder,
	onMediaStateUpdate,
	track,
	convertMediaState,
}: {
	frame: VideoFrame;
	onVideoFrame: ConvertMediaOnVideoFrame | null;
	videoEncoder: WebCodecsVideoEncoder;
	onMediaStateUpdate: ConvertMediaOnMediaStateUpdate | null;
	track: VideoTrack;
	convertMediaState: ConvertMediaState;
}) => {
	const newFrame = onVideoFrame ? await onVideoFrame({frame, track}) : frame;

	if (newFrame.codedHeight !== frame.codedHeight) {
		throw new Error(
			`Returned VideoFrame of track ${track.trackId} has different codedHeight (${newFrame.codedHeight}) than the input frame (${frame.codedHeight})`,
		);
	}

	if (newFrame.codedWidth !== frame.codedWidth) {
		throw new Error(
			`Returned VideoFrame of track ${track.trackId} has different codedWidth (${newFrame.codedWidth}) than the input frame (${frame.codedWidth})`,
		);
	}

	if (newFrame.displayWidth !== frame.displayWidth) {
		throw new Error(
			`Returned VideoFrame of track ${track.trackId} has different displayWidth (${newFrame.displayWidth}) than the input frame (${newFrame.displayHeight})`,
		);
	}

	if (newFrame.displayHeight !== frame.displayHeight) {
		throw new Error(
			`Returned VideoFrame of track ${track.trackId} has different displayHeight (${newFrame.displayHeight}) than the input frame (${newFrame.displayHeight})`,
		);
	}

	await videoEncoder.encodeFrame(newFrame);
	convertMediaState.decodedVideoFrames++;
	onMediaStateUpdate?.({...convertMediaState});

	newFrame.close();
	if (frame !== newFrame) {
		frame.close();
	}
};
