import {useCallback, useMemo} from 'react';
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

export const useSequenceFreezeFrameMenuItem = ({
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
		clientId !== null &&
		Boolean(sequence.controls) &&
		nodePath !== null &&
		validatedSource !== null &&
		freezeStatus !== undefined &&
		freezeStatus !== null &&
		freezeStatus.status === 'static';

	const onToggleFreezeFrame = useCallback(() => {
		if (
			!canToggleFreeze ||
			!sequence.controls ||
			nodePath === null ||
			validatedSource === null ||
			clientId === null
		) {
			return;
		}

		const rawFreezeFrame = Math.round(
			timelinePosition - sequence.from + sequenceFrameOffset,
		);
		const maxFrame = Number.isFinite(sequence.duration)
			? Math.max(0, sequence.duration - 1)
			: rawFreezeFrame;
		const freezeFrame = Math.min(Math.max(0, rawFreezeFrame), maxFrame);
		const remove = isFrozen;

		saveSequenceProps({
			changes: [
				{
					fileName: validatedSource,
					nodePath,
					fieldKey: 'freeze',
					value: remove ? null : freezeFrame,
					defaultValue: null,
					schema: sequence.controls.schema,
				},
			],
			setPropStatuses,
			clientId,
			undoLabel: remove ? 'Unfreeze sequence' : 'Freeze sequence',
			redoLabel: remove ? 'Freeze sequence again' : 'Unfreeze sequence again',
		});
	}, [
		canToggleFreeze,
		clientId,
		isFrozen,
		nodePath,
		sequence.controls,
		sequence.duration,
		sequence.from,
		sequenceFrameOffset,
		setPropStatuses,
		timelinePosition,
		validatedSource,
	]);

	return useMemo(
		() =>
			shouldShowFreezeFrameMenuItem(sequence)
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
				: null,
		[canToggleFreeze, isFrozen, onToggleFreezeFrame, sequence],
	);
};
