import type {TSequence} from 'remotion';

export const isVideoWithLastFrameHold = (sequence: TSequence) => {
	return (
		sequence.type === 'video' &&
		sequence.controls?.componentIdentity === 'dev.remotion.media.Video'
	);
};
