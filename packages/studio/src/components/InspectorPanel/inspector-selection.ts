import {
	getTimelineSequenceSelectionKey,
	type TimelineSelection,
} from '../Timeline/TimelineSelection';

export type SequenceSectionSelection = Extract<
	TimelineSelection,
	{
		type:
			| 'sequence'
			| 'sequence-prop'
			| 'sequence-all-effects'
			| 'sequence-effect'
			| 'sequence-effect-prop';
	}
>;

export const isSequenceSectionSelection = (
	selection: TimelineSelection,
): selection is SequenceSectionSelection => {
	return (
		selection.type === 'sequence' ||
		selection.type === 'sequence-prop' ||
		selection.type === 'sequence-all-effects' ||
		selection.type === 'sequence-effect' ||
		selection.type === 'sequence-effect-prop'
	);
};

type SameSequenceInspectorSelection = Extract<
	TimelineSelection,
	{type: 'sequence-prop' | 'sequence-effect' | 'sequence-effect-prop'}
>;

const isSameSequenceInspectorSelection = (
	selection: TimelineSelection,
): selection is SameSequenceInspectorSelection => {
	return (
		selection.type === 'sequence-prop' ||
		selection.type === 'sequence-effect' ||
		selection.type === 'sequence-effect-prop'
	);
};

export const getSameSequenceInspectorSelection = (
	selections: readonly TimelineSelection[],
): SameSequenceInspectorSelection | null => {
	const firstSelection = selections[0];
	if (!firstSelection || !isSameSequenceInspectorSelection(firstSelection)) {
		return null;
	}

	const rootSequenceKey = getTimelineSequenceSelectionKey(
		firstSelection.nodePathInfo,
	);
	for (const selection of selections) {
		if (!isSameSequenceInspectorSelection(selection)) {
			return null;
		}

		if (
			getTimelineSequenceSelectionKey(selection.nodePathInfo) !==
			rootSequenceKey
		) {
			return null;
		}
	}

	return firstSelection;
};
