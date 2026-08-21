import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {timelineSequenceNodePathToKey} from '../helpers/timeline-node-path-key';
import {
	useIsTimelineSequenceHovered,
	useSetTimelineSequenceHover,
} from '../state/timeline-sequence-hover';
import {getSelectedOutlineControlLayout} from './selected-outline-control-layout';
import type {SelectedOutline} from './selected-outline-geometry';
import type {
	SelectedOutlineContextMenuOpenHandler,
	SelectedOutlineLayoutTarget,
	SelectedOutlineRotationDragTarget,
	SelectedOutlineScaleDragTarget,
	SelectedOutlineTarget,
} from './selected-outline-types';
import {SelectedOutlineCropControls} from './SelectedOutlineCropControls';
import {SelectedOutlineRotationCornerHandle} from './SelectedOutlineRotationCornerHandle';
import {SelectedOutlineScaleEdgeLine} from './SelectedOutlineScaleEdgeLine';
import type {
	TimelineSelection,
	TimelineSelectionInteraction,
} from './Timeline/TimelineSelection';

export const SelectedOutlineEditingHandles: React.FC<{
	readonly dragging: boolean;
	readonly getAllRotationDragTargets: () => readonly SelectedOutlineRotationDragTarget[];
	readonly getAllScaleDragTargets: () => readonly SelectedOutlineScaleDragTarget[];
	readonly getContextMenuOpenByKey: (
		key: string,
	) => SelectedOutlineContextMenuOpenHandler | undefined;
	readonly getLatestTargetByKey: (
		key: string,
	) => SelectedOutlineTarget | undefined;
	readonly layoutTarget: SelectedOutlineLayoutTarget | undefined;
	readonly onContextMenuOpenChange: (open: boolean) => void;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly onSelect: (
		item: TimelineSelection,
		interaction: TimelineSelectionInteraction,
	) => void;
	readonly outline: SelectedOutline;
}> = ({
	dragging,
	getAllRotationDragTargets,
	getAllScaleDragTargets,
	getContextMenuOpenByKey,
	getLatestTargetByKey,
	layoutTarget,
	onContextMenuOpenChange,
	onDraggingChange,
	onSelect,
	outline,
}) => {
	const setHoveredSequence = useSetTimelineSequenceHover();
	const targetRef = useRef(layoutTarget);
	useLayoutEffect(() => {
		targetRef.current = layoutTarget;
	}, [layoutTarget]);
	const hoveredNodePathKey = useMemo(
		() =>
			layoutTarget === undefined
				? null
				: timelineSequenceNodePathToKey(
						layoutTarget.nodePathInfo.sequenceSubscriptionKey,
					),
		[layoutTarget],
	);
	const hovered = useIsTimelineSequenceHovered(hoveredNodePathKey);
	const controlTarget =
		layoutTarget !== undefined && (layoutTarget.containsSelection || hovered)
			? getLatestTargetByKey(layoutTarget.key)
			: undefined;
	const controlLayout = useMemo(
		() => getSelectedOutlineControlLayout(outline.points),
		[outline.points],
	);
	const onHoverChange = React.useCallback(
		(key: string | null) => {
			setHoveredSequence((currentHover) => {
				if (key !== null) {
					const hoverTarget = targetRef.current;
					if (hoverTarget === undefined || hoverTarget.key !== key) {
						return currentHover;
					}

					return {
						key,
						nodePathKey: timelineSequenceNodePathToKey(
							hoverTarget.nodePathInfo.sequenceSubscriptionKey,
						),
						source: 'canvas',
					};
				}

				return currentHover?.source === 'canvas' ? null : currentHover;
			});
		},
		[setHoveredSequence],
	);
	const onContextMenuOpen = React.useCallback(() => {
		return getContextMenuOpenByKey(outline.key)?.() ?? false;
	}, [getContextMenuOpenByKey, outline.key]);

	return (
		<>
			<SelectedOutlineCropControls
				outline={outline}
				onDraggingChange={onDraggingChange}
				target={controlTarget}
			/>
			{controlTarget?.cropDrag === null &&
			(layoutTarget?.containsSelection || hovered)
				? controlLayout.scaleEdges.map((edge) => (
						<SelectedOutlineScaleEdgeLine
							key={edge}
							getAllScaleDragTargets={getAllScaleDragTargets}
							dragging={dragging}
							edge={edge}
							hitWidth={
								edge === 'top' || edge === 'bottom'
									? controlLayout.scaleHitWidth.horizontal
									: controlLayout.scaleHitWidth.vertical
							}
							outline={outline}
							onContextMenuOpen={onContextMenuOpen}
							onContextMenuOpenChange={onContextMenuOpenChange}
							onDraggingChange={onDraggingChange}
							onHoverChange={onHoverChange}
							onSelect={onSelect}
							target={controlTarget}
						/>
					))
				: null}
			{controlTarget?.cropDrag === null &&
			(layoutTarget?.containsSelection || hovered)
				? controlLayout.rotationCorners.map(({corner, point}) => (
						<SelectedOutlineRotationCornerHandle
							key={corner}
							getAllRotationDragTargets={getAllRotationDragTargets}
							corner={corner}
							dragging={dragging}
							handlePoint={point}
							outline={outline}
							onContextMenuOpen={onContextMenuOpen}
							onContextMenuOpenChange={onContextMenuOpenChange}
							onDraggingChange={onDraggingChange}
							onHoverChange={onHoverChange}
							onSelect={onSelect}
							radius={controlLayout.rotationHandleRadius}
							target={controlTarget}
						/>
					))
				: null}
		</>
	);
};
