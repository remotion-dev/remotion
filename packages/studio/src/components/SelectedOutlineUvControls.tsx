import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {BLUE} from '../helpers/colors';
import type {OutlinePoint, SelectedOutline} from './selected-outline-geometry';
import {
	constrainUv,
	getUvCoordinateForPoint,
	getUvHandleConnectionLines,
	getUvHandlePosition,
	tuplesEqual,
	type SelectedOutlineUvHandle,
	type UvCoordinate,
} from './selected-outline-uv';
import {callAddEffectKeyframe} from './Timeline/call-add-keyframe';
import {saveEffectProp} from './Timeline/save-effect-prop';

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
	readonly handle: SelectedOutlineUvHandle;
	readonly outline: SelectedOutline;
}> = ({handle, onDraggingChange, outline}) => {
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

			const svg = event.currentTarget.ownerSVGElement;
			if (svg === null) {
				return;
			}

			const svgRect = svg.getBoundingClientRect();
			let lastValue: UvCoordinate | null = null;
			onDraggingChange(true);
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
				const nextValue = constrainUv(
					getUvCoordinateForPoint(outline.points, point),
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

			updateFromPointerEvent(event);

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();
				updateFromPointerEvent(moveEvent);
			};

			const onPointerUp = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerUp);
				onDraggingChange(false);

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
			onDraggingChange,
			outline.points,
			setPropStatuses,
			setEffectDragOverrides,
		],
	);

	return (
		<circle
			cx={position.x}
			cy={position.y}
			r={6}
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
	readonly outline: SelectedOutline;
	readonly target: UvTarget | undefined;
}> = ({onDraggingChange, outline, target}) => {
	if (!target?.containsSelection || target.uvHandles.length === 0) {
		return null;
	}

	return (
		<>
			{target.uvHandles.map((handle) => (
				<SelectedUvHandleCircle
					key={`${handle.effectIndex}-${handle.fieldKey}`}
					handle={handle}
					onDraggingChange={onDraggingChange}
					outline={outline}
				/>
			))}
		</>
	);
};
