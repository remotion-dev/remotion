import {useCallback, useContext, useRef} from 'react';
import {canUseEffectOperations} from '../helpers/browser-studio-operations';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {SidebarContext} from '../state/sidebar';
import {useCurrentTimelineSelectionStateAsRef} from './Timeline/TimelineSelection';

export const useSelectEffects = () => {
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	const sidebar = useContext(SidebarContext);
	const sidebarRef = useRef(sidebar);
	sidebarRef.current = sidebar;

	return useCallback(
		(nodePathInfo: SequenceNodePathInfo) => {
			if (
				!nodePathInfo.supportsEffects ||
				!currentSelection.current.canSelect ||
				!canUseEffectOperations()
			) {
				return false;
			}

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
		[currentSelection],
	);
};
