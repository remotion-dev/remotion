import type {
	CanUpdateSequencePropStatus,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {saveSequenceProps, type SetPropStatuses} from './save-sequence-prop';

export const shouldShowFreezeFrameMenuItem = (sequence: TSequence): boolean => {
	return sequence.type !== 'audio';
};

export const isSequenceVisibleAtTimelinePosition = ({
	sequence,
	timelinePosition,
}: {
	readonly sequence: TSequence;
	readonly timelinePosition: number;
}): boolean => {
	return (
		timelinePosition >= sequence.from &&
		timelinePosition < sequence.from + sequence.duration
	);
};

export const calculateSequenceFreezeFrame = ({
	sequence,
	sequenceFrameOffset,
	timelinePosition,
}: {
	readonly sequence: TSequence;
	readonly sequenceFrameOffset: number;
	readonly timelinePosition: number;
}): number => {
	const rawFreezeFrame = Math.round(
		timelinePosition - sequence.from + sequenceFrameOffset,
	);
	const minFrame = sequenceFrameOffset;
	const maxFrame = Number.isFinite(sequence.duration)
		? Math.max(minFrame, sequence.duration + sequenceFrameOffset - 1)
		: Infinity;

	return Math.min(Math.max(minFrame, rawFreezeFrame), maxFrame);
};

export const getSequenceFreezeFrameMenuItem = ({
	clientId,
	nodePath,
	propStatusesForOverride,
	sequence,
	sequenceFrameOffset,
	setPropStatuses,
	timelinePosition,
	validatedSource,
}: {
	readonly clientId: string | null;
	readonly nodePath: SequencePropsSubscriptionKey | null;
	readonly propStatusesForOverride:
		| Record<string, CanUpdateSequencePropStatus>
		| undefined;
	readonly sequence: TSequence;
	readonly sequenceFrameOffset: number;
	readonly setPropStatuses: SetPropStatuses;
	readonly timelinePosition: number;
	readonly validatedSource: string | null;
}): ComboboxValue | null => {
	const freezeStatus = propStatusesForOverride?.freeze;
	const isFrozen =
		freezeStatus?.status === 'static' &&
		typeof freezeStatus.codeValue === 'number';

	const canToggleFreeze =
		isSequenceVisibleAtTimelinePosition({sequence, timelinePosition}) &&
		clientId !== null &&
		Boolean(sequence.controls) &&
		nodePath !== null &&
		validatedSource !== null &&
		freezeStatus !== undefined &&
		freezeStatus !== null &&
		freezeStatus.status === 'static';

	const onToggleFreezeFrame = () => {
		if (
			!canToggleFreeze ||
			!sequence.controls ||
			nodePath === null ||
			validatedSource === null ||
			clientId === null
		) {
			return;
		}

		const freezeFrame = calculateSequenceFreezeFrame({
			sequence,
			sequenceFrameOffset,
			timelinePosition,
		});
		const remove = isFrozen;

		saveSequenceProps({
			addedKeyframes: null,
			movedKeyframes: null,
			changes: [
				{
					fileName: validatedSource,
					nodePath,
					fieldKey: 'freeze',
					value: remove ? undefined : freezeFrame,
					defaultValue: null,
					schema: sequence.controls.schema,
				},
			],
			setPropStatuses,
			clientId,
			undoLabel: remove ? 'Unfreeze sequence' : 'Freeze sequence',
			redoLabel: remove ? 'Freeze sequence again' : 'Unfreeze sequence again',
		});
	};

	return shouldShowFreezeFrameMenuItem(sequence)
		? {
				type: 'item' as const,
				id: 'toggle-freeze-frame',
				keyHint: null,
				label: isFrozen ? 'Unfreeze frame' : 'Freeze frame',
				leftItem: null,
				disabled: !canToggleFreeze,
				onClick: onToggleFreezeFrame,
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'toggle-freeze-frame',
			}
		: null;
};
