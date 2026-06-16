import {useContext, useMemo} from 'react';
import {Internals, type TSequence} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {buildTimelineTree} from '../../helpers/timeline-layout';
import {
	ExpandedTracksGetterContext,
	ExpandedTracksSetterContext,
} from '../ExpandedTracksProvider';

export const useTimelineExpandedTree = ({
	sequence,
	nodePathInfo,
}: {
	readonly sequence: TSequence;
	readonly nodePathInfo: SequenceNodePathInfo;
}) => {
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {toggleTrack} = useContext(ExpandedTracksSetterContext);
	const {propStatuses: visualModePropStatuses} = useContext(
		Internals.VisualModePropStatusesContext,
	);
	const {getDragOverrides, getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);

	const tree = useMemo(
		() =>
			buildTimelineTree({
				sequence,
				nodePathInfo,
				getDragOverrides,
				getEffectDragOverrides,
				propStatuses: visualModePropStatuses,
			}),
		[
			sequence,
			nodePathInfo,
			getDragOverrides,
			getEffectDragOverrides,
			visualModePropStatuses,
		],
	);

	return {
		getIsExpanded,
		propStatuses: visualModePropStatuses,
		toggleTrack,
		tree,
	};
};
