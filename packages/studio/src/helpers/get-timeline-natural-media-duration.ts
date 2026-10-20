import type {TSequence} from 'remotion';
import {getTimelineMediaStartFrame} from '../components/Timeline/get-timeline-media-start-frame';
import type {MediaMetadata} from './use-media-metadata';

export const getTimelineNaturalMediaDuration = ({
	sequence,
	sequenceFrameOffset,
	mediaMetadata,
	fps,
}: {
	sequence: TSequence;
	sequenceFrameOffset: number;
	mediaMetadata: MediaMetadata | null;
	fps: number;
}): number | null => {
	if (
		(sequence.type !== 'audio' && sequence.type !== 'video') ||
		mediaMetadata === null ||
		sequence.playbackRate <= 0
	) {
		return null;
	}

	return Math.max(
		0,
		(mediaMetadata.duration * fps -
			getTimelineMediaStartFrame({
				startMediaFrom: sequence.startMediaFrom,
				mediaFrameAtSequenceZero: sequence.mediaFrameAtSequenceZero,
				sequenceFrameOffset,
				playbackRate: sequence.playbackRate,
			})) /
			(sequence.playbackRate * sequence.sequencePlaybackRate),
	);
};
