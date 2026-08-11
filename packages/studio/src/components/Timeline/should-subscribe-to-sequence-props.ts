import type {TSequence} from 'remotion';

export const shouldSubscribeToSequenceProps = (
	sequence: TSequence,
	previewConnected: boolean,
): sequence is TSequence & {
	readonly controls: NonNullable<TSequence['controls']>;
} => {
	return (
		sequence.showInTimeline &&
		Boolean(sequence.controls) &&
		previewConnected &&
		Boolean(sequence.getStack())
	);
};
