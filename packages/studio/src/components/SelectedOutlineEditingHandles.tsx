import React, {useMemo} from 'react';
import {getSelectedOutlineControlLayout} from './selected-outline-control-layout';
import type {SelectedOutline} from './selected-outline-geometry';
import type {
	SelectedOutlineContextMenuOpenHandler,
	SelectedOutlineLayoutTarget,
	SelectedOutlineRotationDragTarget,
	SelectedOutlineScaleDragTarget,
	SelectedOutlineTarget,
} from './selected-outline-types';
import {SelectedOutlineBorderRadiusHandle} from './SelectedOutlineBorderRadiusHandle';
import {SelectedOutlineCropControls} from './SelectedOutlineCropControls';
import {SelectedOutlineRotationCornerHandle} from './SelectedOutlineRotationCornerHandle';
import {SelectedOutlineScaleEdgeLine} from './SelectedOutlineScaleEdgeLine';
import type {
	TimelineSelection,
	TimelineSelectionInteraction,
} from './Timeline/TimelineSelection';
import {useSelectedOutlineControlTarget} from './use-selected-outline-control-target';

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
	const {controlTarget, hovered, onHoverChange} =
		useSelectedOutlineControlTarget({
			getLatestTargetByKey,
			layoutTarget,
		});
	const controlLayout = useMemo(
		() => getSelectedOutlineControlLayout(outline.points),
		[outline.points],
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
			{controlTarget?.borderRadiusDrag === null &&
			(layoutTarget?.containsSelection || hovered)
				? (() => {
						const handle = controlLayout.borderRadiusHandle;
						if (handle === undefined) {
							return null;
						}

						return (
							<SelectedOutlineBorderRadiusHandle
								key="border-radius"
								handlePoint={handle}
								onDraggingChange={onDraggingChange}
								outline={outline}
								radius={controlLayout.borderRadiusHandleRadius}
								target={controlTarget?.borderRadiusDrag}
							/>
						);
					})()
				: null}
		</>
	);
};
