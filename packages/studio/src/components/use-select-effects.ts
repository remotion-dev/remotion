import {useCallback, useContext, useRef} from 'react';
import {Internals} from 'remotion';
import {canUseEffectOperations} from '../helpers/browser-studio-operations';
import {useTimelineCalculator} from '../helpers/calculate-timeline';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {SidebarContext} from '../state/sidebar';
import {OverrideIdToNodePathMappingsRefContext} from './SequencePropsSubscriptionProvider';
import {findTrackForNodePathInfo} from './Timeline/find-track-for-node-path-info';
import {useCurrentTimelineSelectionStateAsRef} from './Timeline/TimelineSelection';
import {canApplyEffects} from './use-prepare-html-in-canvas-wrap';

export const useSelectEffects = () => {
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	const sidebar = useContext(SidebarContext);
	const calculateTimeline = useTimelineCalculator();
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const mappingsRef = useContext(OverrideIdToNodePathMappingsRefContext);
	const sidebarRef = useRef(sidebar);
	sidebarRef.current = sidebar;

	return useCallback(
		(nodePathInfo: SequenceNodePathInfo) => {
			if (!currentSelection.current.canSelect || !canUseEffectOperations()) {
				return false;
			}

			const {tracks} = calculateTimeline({
				sequences: sequencesRef.current,
				overrideIdsToNodePaths: mappingsRef.current,
			});
			const track = findTrackForNodePathInfo({tracks, nodePathInfo});
			if (!track || !canApplyEffects(track.sequence, nodePathInfo))
				return false;

			currentSelection.current.selectItems(
				[
					{
						type: 'sequence-all-effects',
						nodePathInfo: {...nodePathInfo, auxiliaryKeys: ['effects']},
					},
				],
				{reveal: true},
			);

			if (sidebarRef.current.sidebarCollapsedStateRight === 'collapsed') {
				sidebarRef.current.setSidebarCollapsedState({
					left: null,
					right: 'expanded',
				});
			} else if (
				sidebarRef.current.sidebarCollapsedStateRight === 'responsive'
			) {
				sidebarRef.current.setRightSidebarTemporaryExpansion(true);
			}

			return true;
		},
		[calculateTimeline, currentSelection, mappingsRef, sequencesRef],
	);
};
