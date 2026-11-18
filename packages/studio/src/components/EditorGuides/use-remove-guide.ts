import {useCallback, useContext} from 'react';
import {
	EditorShowGuidesRefContext,
	persistGuidesList,
} from '../../state/editor-guides';
import {useCurrentTimelineSelectionStateAsRef} from '../Timeline/TimelineSelection';

export const useRemoveGuide = () => {
	const guidesRef = useContext(EditorShowGuidesRefContext);
	const currentSelection = useCurrentTimelineSelectionStateAsRef();

	return useCallback(
		(guideId: string) => {
			const state = guidesRef?.current;
			if (!state) return;
			const previousGuides = state.guidesListRef.current;
			const guide = previousGuides.find((item) => item.id === guideId);
			if (!guide) return;

			state.setGuidesList((guides) => {
				const next = guides.filter((item) => item.id !== guideId);
				persistGuidesList(next);
				return next;
			});

			const {selectedItems, selectItems} = currentSelection.current;
			if (
				!selectedItems.some(
					(item) => item.type === 'guide' && item.guideId === guideId,
				)
			) {
				return;
			}

			const orderedGuides = previousGuides
				.filter(
					(item) =>
						item.compositionId === guide.compositionId &&
						item.orientation === guide.orientation &&
						(item.show || item.id === guideId),
				)
				.sort((a, b) => a.position - b.position);
			const index = orderedGuides.findIndex((item) => item.id === guideId);
			const neighbor = orderedGuides[index + 1] ?? orderedGuides[index - 1];
			selectItems(neighbor ? [{type: 'guide', guideId: neighbor.id}] : []);
		},
		[currentSelection, guidesRef],
	);
};
