import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {BLUE} from '../helpers/colors';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from './ForceSpecificCursor';
import {
	isSelectedOutlineDragPastThreshold,
	snapSelectedOutlineUv,
} from './selected-outline-drag';
import type {OutlinePoint, SelectedOutline} from './selected-outline-geometry';
import {getOutlineSelectionInteraction} from './selected-outline-measurement';
import {
	constrainUv,
	getUvCoordinateForPoint,
	getUvHandleConnectionLines,
	getUvHandlePosition,
	roundUvCoordinate,
	tuplesEqual,
	type SelectedOutlineUvHandle,
	type UvCoordinate,
} from './selected-outline-uv';
import {callAddEffectKeyframe} from './Timeline/call-add-keyframe';
import {saveEffectProp} from './Timeline/save-effect-prop';
import type {
	TimelineSelection,
	TimelineSelectionInteraction,
} from './Timeline/TimelineSelection';

const getSvgPointFromPointerEvent = ({
	event,
	rect,
}: {
	readonly event: Pick<PointerEvent, 'clientX' | 'clientY'>;
	readonly rect: DOMRect;
}): OutlinePoint => {
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top,
	};
};

const uvHandleRadius = 5;
const selectedUvHandleRadius = 8;

export const getSelectedOutlineUvHandleTimelineSelection = ({
	effectIndex,
	fieldKey,
	nodePathInfo,
}: {
	readonly effectIndex: number;
	readonly fieldKey: string;
	readonly nodePathInfo: SequenceNodePathInfo;
}): TimelineSelection => {
	return {
		type: 'sequence-effect-prop',
		nodePathInfo: {
			...nodePathInfo,
			auxiliaryKeys: ['effects', String(effectIndex), fieldKey],
		},
		i: effectIndex,
		key: fieldKey,
	};
};

const SelectedUvHandleConnectionLines: React.FC<{
	readonly handles: readonly SelectedOutlineUvHandle[];
	readonly outline: SelectedOutline;
}> = ({handles, outline}) => {
	const lines = useMemo(
		() => getUvHandleConnectionLines({handles, points: outline.points}),
		[handles, outline.points],
	);

	return (
		<>
			{lines.map((line) => (
				<line
					key={line.key}
					x1={line.from.x}
					y1={line.from.y}
					x2={line.to.x}
					y2={line.to.y}
					stroke={BLUE}
					strokeWidth={2}
					vectorEffect="non-scaling-stroke"
					pointerEvents="none"
				/>
			))}
		</>
	);
};

const SelectedUvHandleCircle: React.FC<{
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly onSelect: (
		item: TimelineSelection,
		interaction?: TimelineSelectionInteraction,
	) => void;
	readonly handle: SelectedOutlineUvHandle;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly outline: SelectedOutline;
}> = ({handle, nodePathInfo, onDraggingChange, onSelect, outline}) => {
	const {setEffectDragOverrides, clearEffectDragOverrides, setPropStatuses} =
		useContext(Internals.VisualModeSettersContext);
	const position = useMemo(
		() => getUvHandlePosition(outline.points, handle.value),
		[handle.value, outline.points],
	);

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGCircleElement>) => {
			if (event.button !== 0) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			const interaction = getOutlineSelectionInteraction(event);
			onSelect(
				getSelectedOutlineUvHandleTimelineSelection({
					effectIndex: handle.effectIndex,
					fieldKey: handle.fieldKey,
					nodePathInfo,
				}),
				interaction,
			);

			if (interaction.shiftKey || interaction.toggleKey) {
				return;
			}

			const svg = event.currentTarget.ownerSVGElement;
			if (svg === null) {
				return;
			}

			const svgRect = svg.getBoundingClientRect();
			const startPointerX = event.clientX;
			const startPointerY = event.clientY;
			let lastValue: UvCoordinate | null = null;
			let dragging = false;
			const defaultValue =
				handle.fieldDefault !== undefined
					? JSON.stringify(handle.fieldDefault)
					: null;

			const updateFromPointerEvent = (
				pointerEvent: PointerEvent | React.PointerEvent<SVGCircleElement>,
			) => {
				const point = getSvgPointFromPointerEvent({
					event: pointerEvent,
					rect: svgRect,
				});
				const rawUv = getUvCoordinateForPoint(outline.points, point);
				const snappedUv = snapSelectedOutlineUv({
					point,
					points: outline.points,
					uv: rawUv,
				});
				const nextValue = roundUvCoordinate(
					constrainUv(snappedUv, handle.fieldSchema),
					handle.fieldSchema,
				);
				lastValue = nextValue;
				setEffectDragOverrides(
					handle.nodePath,
					handle.effectIndex,
					handle.fieldKey,
					handle.propStatus.status === 'keyframed'
						? Internals.makeKeyframedDragOverride({
								status: handle.propStatus,
								frame: handle.sourceFrame,
								value: nextValue,
							})
						: Internals.makeStaticDragOverride(nextValue),
				);
			};

			const updateDragFromPointerEvent = (pointerEvent: PointerEvent) => {
				if (!dragging) {
					const deltaX = pointerEvent.clientX - startPointerX;
					const deltaY = pointerEvent.clientY - startPointerY;
					if (!isSelectedOutlineDragPastThreshold({deltaX, deltaY})) {
						return;
					}

					dragging = true;
					forceSpecificCursor('default');
					onDraggingChange(true);
				}

				updateFromPointerEvent(pointerEvent);
			};

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();
				updateDragFromPointerEvent(moveEvent);
			};

			const onPointerUp = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerUp);
				if (dragging) {
					stopForcingSpecificCursor();
					onDraggingChange(false);
				}

				const stringifiedValue =
					lastValue === null ? null : JSON.stringify(lastValue);
				const shouldSave = (() => {
					if (lastValue === null) {
						return false;
					}

					if (handle.propStatus.status === 'keyframed') {
						return !tuplesEqual(handle.value, lastValue);
					}

					return (
						!tuplesEqual(handle.propStatus.codeValue, lastValue) &&
						!(
							defaultValue === stringifiedValue &&
							handle.propStatus.codeValue === undefined
						)
					);
				})();

				if (!shouldSave) {
					clearEffectDragOverrides(handle.nodePath, handle.effectIndex);
					return;
				}

				(handle.propStatus.status === 'keyframed'
					? callAddEffectKeyframe({
							fileName: handle.nodePath.absolutePath,
							nodePath: handle.nodePath,
							effectIndex: handle.effectIndex,
							fieldKey: handle.fieldKey,
							sourceFrame: handle.sourceFrame,
							value: lastValue,
							schema: handle.schema,
							setPropStatuses,
							clientId: handle.clientId,
						})
					: saveEffectProp({
							type: 'value',
							fileName: handle.nodePath.absolutePath,
							nodePath: handle.nodePath,
							effectIndex: handle.effectIndex,
							fieldKey: handle.fieldKey,
							value: lastValue,
							defaultValue,
							schema: handle.schema,
							setPropStatuses,
							clientId: handle.clientId,
						})
				).finally(() => {
					clearEffectDragOverrides(handle.nodePath, handle.effectIndex);
				});
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerUp);
		},
		[
			clearEffectDragOverrides,
			handle,
			nodePathInfo,
			onDraggingChange,
			onSelect,
			outline.points,
			setPropStatuses,
			setEffectDragOverrides,
		],
	);

	return (
		<circle
			cx={position.x}
			cy={position.y}
			r={handle.isSelected ? selectedUvHandleRadius : uvHandleRadius}
			fill="white"
			stroke={BLUE}
			strokeWidth={2}
			vectorEffect="non-scaling-stroke"
			pointerEvents="all"
			cursor="default"
			onPointerDown={onPointerDown}
		/>
	);
};

type UvTarget = {
	readonly containsSelection: boolean;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly uvHandles: readonly SelectedOutlineUvHandle[];
};

export const SelectedOutlineUvHandleConnectionLayer: React.FC<{
	readonly outline: SelectedOutline;
	readonly target: UvTarget | undefined;
}> = ({outline, target}) => {
	if (!target?.containsSelection || target.uvHandles.length === 0) {
		return null;
	}

	return (
		<SelectedUvHandleConnectionLines
			handles={target.uvHandles}
			outline={outline}
		/>
	);
};

export const SelectedOutlineUvHandleCircleLayer: React.FC<{
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly onSelect: (
		item: TimelineSelection,
		interaction?: TimelineSelectionInteraction,
	) => void;
	readonly outline: SelectedOutline;
	readonly target: UvTarget | undefined;
}> = ({onDraggingChange, onSelect, outline, target}) => {
	if (!target?.containsSelection || target.uvHandles.length === 0) {
		return null;
	}

	return (
		<>
			{target.uvHandles.map((handle) => (
				<SelectedUvHandleCircle
					key={`${handle.effectIndex}-${handle.fieldKey}`}
					handle={handle}
					nodePathInfo={target.nodePathInfo}
					onDraggingChange={onDraggingChange}
					onSelect={onSelect}
					outline={outline}
				/>
			))}
		</>
	);
};
