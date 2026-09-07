import type {TSequence} from 'remotion';

export type TranscribableSequence =
	| Extract<TSequence, {type: 'audio'}>
	| Extract<TSequence, {type: 'video'}>;

const modernComponentIdentities = {
	audio: 'dev.remotion.media.Audio',
	video: 'dev.remotion.media.Video',
} as const;

const legacyDocumentationLinks = {
	audio: 'https://www.remotion.dev/docs/html5-audio',
	video: 'https://www.remotion.dev/docs/html5-video',
} as const;

export const isTranscribableSequence = (
	sequence: TSequence,
): sequence is TranscribableSequence => {
	if (sequence.type !== 'audio' && sequence.type !== 'video') {
		return false;
	}

	return (
		sequence.controls?.componentIdentity ===
			modernComponentIdentities[sequence.type] ||
		sequence.documentationLink === legacyDocumentationLinks[sequence.type]
	);
};
