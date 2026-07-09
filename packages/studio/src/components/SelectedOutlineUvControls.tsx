import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {BLUE, SELECTED_OUTLINE_UV_DROP_SHADOW, WHITE} from '../helpers/colors';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {EditorSnappingContext} from '../state/editor-snapping';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from './ForceSpecificCursor';
import {
	isSelectedOutlineDragPastThreshold,
	snapSelectedOutlineUv,
	selectedOutlineRotationSnapStepDegrees,
} from './selected-outline-drag';
import type {OutlinePoint, SelectedOutline} from './selected-outline-geometry';
import {getOutlineSelectionInteraction} from './selected-outline-measurement';
import {
	getAngleDegrees,
	getRotationCursor,
	getSelectedOutlineRotationDeltaDegrees,
} from './selected-outline-measurement';
import {
	constrainUv,
	getUvEllipseInteractiveControls,
	getUvHandleConnectionEllipses,
	getUvCoordinateForPoint,
	getUvHandleConnectionLines,
	getUvHandlePosition,
	roundNumericUvEllipseValue,
	roundUvCoordinate,
	tuplesEqual,
	type SelectedOutlineUvHandle,
	type UvEllipseInteractiveControls,
	type UvEllipseResizeAxis,
	type UvEllipseControlField,
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

const uvHandleRadius = 4.25;
const selectedUvHandleRadius = 6.8;
const ellipseControlRadius = 5.2;
const uvHandleStyle: React.CSSProperties = {
	filter: SELECTED_OUTLINE_UV_DROP_SHADOW,
};

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
	const ellipses = useMemo(
		() =>
			getUvHandleConnectionEllipses({
				handles,
				dimensions: outline.dimensions,
				points: outline.points,
			}),
		[handles, outline.dimensions, outline.points],
	);

	return (
		<>
			{ellipses.map((ellipse) => (
				<polyline
					key={ellipse.key}
					points={ellipse.points
						.map((point) => `${point.x},${point.y}`)
						.join(' ')}
					fill="none"
					stroke={BLUE}
					strokeWidth={2}
					vectorEffect="non-scaling-stroke"
					pointerEvents="none"
				/>
			))}
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

const fieldDefaultToString = (value: unknown): string | null =>
	value !== undefined ? JSON.stringify(value) : null;

const shouldSaveNumericEffectValue = ({
	defaultValue,
	field,
	value,
}: {
	readonly defaultValue: string | null;
	readonly field: UvEllipseControlField;
	readonly value: number | null;
}): boolean => {
	if (value === null) {
		return false;
	}

	if (field.propStatus.status === 'keyframed') {
		return field.value !== value;
	}

	const stringifiedValue = JSON.stringify(value);
	return (
		field.propStatus.codeValue !== value &&
		!(
			defaultValue === stringifiedValue &&
			field.propStatus.codeValue === undefined
		)
	);
};

const saveNumericEffectField = ({
	clearEffectDragOverrides,
	clientId,
	effectIndex,
	field,
	lastValue,
	nodePath,
	schema,
	setPropStatuses,
	sourceFrame,
}: {
	readonly clearEffectDragOverrides: React.ContextType<
		typeof Internals.VisualModeSettersContext
	>['clearEffectDragOverrides'];
	readonly clientId: string;
	readonly effectIndex: number;
	readonly field: UvEllipseControlField;
	readonly lastValue: number | null;
	readonly nodePath: SelectedOutlineUvHandle['nodePath'];
	readonly schema: SelectedOutlineUvHandle['schema'];
	readonly setPropStatuses: React.ContextType<
		typeof Internals.VisualModeSettersContext
	>['setPropStatuses'];
	readonly sourceFrame: number;
}): void => {
	const defaultValue = fieldDefaultToString(field.fieldDefault);
	if (
		!shouldSaveNumericEffectValue({
			defaultValue,
			field,
			value: lastValue,
		})
	) {
		clearEffectDragOverrides(nodePath, effectIndex);
		return;
	}

	(field.propStatus.status === 'keyframed'
		? callAddEffectKeyframe({
				fileName: nodePath.absolutePath,
				nodePath,
				effectIndex,
				fieldKey: field.fieldKey,
				sourceFrame,
				value: lastValue,
				schema,
				setPropStatuses,
				clientId,
			})
		: saveEffectProp({
				type: 'value',
				fileName: nodePath.absolutePath,
				nodePath,
				effectIndex,
				fieldKey: field.fieldKey,
				value: lastValue,
				defaultValue,
				schema,
				setPropStatuses,
				clientId,
			})
	).finally(() => {
		clearEffectDragOverrides(nodePath, effectIndex);
	});
};

const getLocalEllipseAxisValue = ({
	axis,
	center,
	dimensions,
	point,
	rotation,
}: {
	readonly axis: UvEllipseResizeAxis;
	readonly center: UvCoordinate;
	readonly dimensions: SelectedOutline['dimensions'];
	readonly point: UvCoordinate;
	readonly rotation: number;
}): number => {
	const radians = (rotation / 180) * Math.PI;
	const deltaX = point[0] - center[0];
	const deltaY = point[1] - center[1];
	const axisX = axis === 'width' ? Math.cos(radians) : -Math.sin(radians);
	const axisY = axis === 'width' ? Math.sin(radians) : Math.cos(radians);

	if (dimensions !== null && dimensions.width > 0 && dimensions.height > 0) {
		const pixelDeltaX = deltaX * dimensions.width;
		const pixelDeltaY = deltaY * dimensions.height;
		const pixelAxisValue = pixelDeltaX * axisX + pixelDeltaY * axisY;

		return (
			pixelAxisValue / (axis === 'width' ? dimensions.width : dimensions.height)
		);
	}

	return deltaX * axisX + deltaY * axisY;
};

const getLocalEllipseWidthProgress = ({
	center,
	dimensions,
	point,
	rotation,
	width,
}: {
	readonly center: UvCoordinate;
	readonly dimensions: SelectedOutline['dimensions'];
	readonly point: UvCoordinate;
	readonly rotation: number;
	readonly width: number;
}): number => {
	if (width <= 0.000001) {
		return 0;
	}

	return (
		getLocalEllipseAxisValue({
			axis: 'width',
			center,
			dimensions,
			point,
			rotation,
		}) /
		(width / 2)
	);
};

const SelectedUvEllipseStartHandle: React.FC<{
	readonly control: UvEllipseInteractiveControls;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly outline: SelectedOutline;
}> = ({control, onDraggingChange, outline}) => {
	const {setEffectDragOverrides, clearEffectDragOverrides, setPropStatuses} =
		useContext(Internals.VisualModeSettersContext);
	const {startControl} = control;
	const field = startControl?.field;

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGCircleElement>) => {
			if (startControl === null || field === undefined) {
				return;
			}

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
			const startPointerX = event.clientX;
			const startPointerY = event.clientY;
			let dragging = false;
			let lastValue: number | null = null;

			const updateFromPointerEvent = (pointerEvent: PointerEvent) => {
				const point = getSvgPointFromPointerEvent({
					event: pointerEvent,
					rect: svgRect,
				});
				const uv = getUvCoordinateForPoint(outline.points, point);
				const nextValue = roundNumericUvEllipseValue(
					getLocalEllipseWidthProgress({
						center: control.handle.value,
						dimensions: outline.dimensions,
						point: uv,
						rotation: control.rotation,
						width: control.width,
					}),
					field.fieldSchema,
				);
				lastValue = nextValue;
				setEffectDragOverrides(
					control.handle.nodePath,
					control.handle.effectIndex,
					field.fieldKey,
					field.propStatus.status === 'keyframed'
						? Internals.makeKeyframedDragOverride({
								status: field.propStatus,
								frame: control.handle.sourceFrame,
								value: nextValue,
							})
						: Internals.makeStaticDragOverride(nextValue),
				);
			};

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();
				const deltaX = moveEvent.clientX - startPointerX;
				const deltaY = moveEvent.clientY - startPointerY;
				if (!dragging) {
					if (!isSelectedOutlineDragPastThreshold({deltaX, deltaY})) {
						return;
					}

					dragging = true;
					forceSpecificCursor(startControl.cursor);
					onDraggingChange(true);
				}

				updateFromPointerEvent(moveEvent);
			};

			const onPointerUp = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerUp);
				if (dragging) {
					stopForcingSpecificCursor();
					onDraggingChange(false);
				}

				saveNumericEffectField({
					clearEffectDragOverrides,
					clientId: control.handle.clientId,
					effectIndex: control.handle.effectIndex,
					field,
					lastValue,
					nodePath: control.handle.nodePath,
					schema: control.handle.schema,
					setPropStatuses,
					sourceFrame: control.handle.sourceFrame,
				});
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerUp);
		},
		[
			clearEffectDragOverrides,
			control.handle,
			control.rotation,
			control.width,
			field,
			onDraggingChange,
			outline.dimensions,
			outline.points,
			setEffectDragOverrides,
			setPropStatuses,
			startControl,
		],
	);

	if (startControl === null || field === undefined) {
		return null;
	}

	return (
		<circle
			cx={startControl.position.x}
			cy={startControl.position.y}
			r={ellipseControlRadius}
			fill={WHITE}
			stroke={BLUE}
			strokeWidth={2}
			style={uvHandleStyle}
			vectorEffect="non-scaling-stroke"
			pointerEvents="all"
			cursor={startControl.cursor}
			onPointerDown={onPointerDown}
		/>
	);
};

const SelectedUvEllipseResizeHandle: React.FC<{
	readonly control: UvEllipseInteractiveControls;
	readonly axis: UvEllipseResizeAxis;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly outline: SelectedOutline;
}> = ({axis, control, onDraggingChange, outline}) => {
	const {setEffectDragOverrides, clearEffectDragOverrides, setPropStatuses} =
		useContext(Internals.VisualModeSettersContext);
	const resizeControl = control.resize.find((item) => item.axis === axis);
	const field = resizeControl?.field;

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGCircleElement>) => {
			if (resizeControl === undefined || field === undefined) {
				return;
			}

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
			const startPointerX = event.clientX;
			const startPointerY = event.clientY;
			let dragging = false;
			let lastValue: number | null = null;

			const updateFromPointerEvent = (pointerEvent: PointerEvent) => {
				const point = getSvgPointFromPointerEvent({
					event: pointerEvent,
					rect: svgRect,
				});
				const uv = getUvCoordinateForPoint(outline.points, point);
				const axisValue = getLocalEllipseAxisValue({
					axis,
					center: control.handle.value,
					dimensions: outline.dimensions,
					point: uv,
					rotation: control.rotation,
				});
				const nextValue = roundNumericUvEllipseValue(
					Math.max(0, axisValue * 2),
					field.fieldSchema,
				);
				lastValue = nextValue;
				setEffectDragOverrides(
					control.handle.nodePath,
					control.handle.effectIndex,
					field.fieldKey,
					field.propStatus.status === 'keyframed'
						? Internals.makeKeyframedDragOverride({
								status: field.propStatus,
								frame: control.handle.sourceFrame,
								value: nextValue,
							})
						: Internals.makeStaticDragOverride(nextValue),
				);
			};

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();
				const deltaX = moveEvent.clientX - startPointerX;
				const deltaY = moveEvent.clientY - startPointerY;
				if (!dragging) {
					if (!isSelectedOutlineDragPastThreshold({deltaX, deltaY})) {
						return;
					}

					dragging = true;
					forceSpecificCursor(resizeControl.cursor);
					onDraggingChange(true);
				}

				updateFromPointerEvent(moveEvent);
			};

			const onPointerUp = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerUp);
				if (dragging) {
					stopForcingSpecificCursor();
					onDraggingChange(false);
				}

				saveNumericEffectField({
					clearEffectDragOverrides,
					clientId: control.handle.clientId,
					effectIndex: control.handle.effectIndex,
					field,
					lastValue,
					nodePath: control.handle.nodePath,
					schema: control.handle.schema,
					setPropStatuses,
					sourceFrame: control.handle.sourceFrame,
				});
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerUp);
		},
		[
			axis,
			clearEffectDragOverrides,
			control.handle,
			control.rotation,
			field,
			onDraggingChange,
			outline.dimensions,
			outline.points,
			resizeControl,
			setEffectDragOverrides,
			setPropStatuses,
		],
	);

	if (resizeControl === undefined || field === undefined) {
		return null;
	}

	return (
		<circle
			cx={resizeControl.position.x}
			cy={resizeControl.position.y}
			r={ellipseControlRadius}
			fill={WHITE}
			stroke={BLUE}
			strokeWidth={2}
			style={uvHandleStyle}
			vectorEffect="non-scaling-stroke"
			pointerEvents="all"
			cursor={resizeControl.cursor}
			onPointerDown={onPointerDown}
		/>
	);
};

const snapRotationDegrees = (value: number): number =>
	Math.round(value / selectedOutlineRotationSnapStepDegrees) *
	selectedOutlineRotationSnapStepDegrees;

const trimLineToCircleEdges = ({
	from,
	fromRadius,
	to,
	toRadius,
}: {
	readonly from: OutlinePoint;
	readonly fromRadius: number;
	readonly to: OutlinePoint;
	readonly toRadius: number;
}): {readonly from: OutlinePoint; readonly to: OutlinePoint} => {
	const deltaX = to.x - from.x;
	const deltaY = to.y - from.y;
	const distance = Math.hypot(deltaX, deltaY);
	if (distance <= fromRadius + toRadius || distance <= 0.000001) {
		const middle = {
			x: (from.x + to.x) / 2,
			y: (from.y + to.y) / 2,
		};
		return {from: middle, to: middle};
	}

	const unitX = deltaX / distance;
	const unitY = deltaY / distance;
	return {
		from: {
			x: from.x + unitX * fromRadius,
			y: from.y + unitY * fromRadius,
		},
		to: {
			x: to.x - unitX * toRadius,
			y: to.y - unitY * toRadius,
		},
	};
};

const SelectedUvEllipseRotationHandle: React.FC<{
	readonly control: UvEllipseInteractiveControls;
	readonly onDraggingChange: (dragging: boolean) => void;
}> = ({control, onDraggingChange}) => {
	const {setEffectDragOverrides, clearEffectDragOverrides, setPropStatuses} =
		useContext(Internals.VisualModeSettersContext);
	const {editorSnapping} = useContext(EditorSnappingContext);
	const {rotationControl} = control;
	const field = rotationControl?.field;

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGCircleElement>) => {
			if (rotationControl === null || field === undefined) {
				return;
			}

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
			const {center} = control;
			const startPointer = {x: event.clientX, y: event.clientY};
			let previousAngle = getAngleDegrees(center, {
				x: event.clientX - svgRect.left,
				y: event.clientY - svgRect.top,
			});
			const startCursorDegrees = previousAngle;
			let accumulatedDelta = 0;
			let rotationLocked = event.shiftKey;
			let dragging = false;
			let lastValue: number | null = null;

			const updateRotationDragOverride = () => {
				const rawValue = control.rotation + accumulatedDelta;
				const snappedValue =
					rotationLocked && editorSnapping
						? snapRotationDegrees(rawValue)
						: rawValue;
				const nextValue = roundNumericUvEllipseValue(
					snappedValue,
					field.fieldSchema,
				);
				const cursorDelta = getSelectedOutlineRotationDeltaDegrees({
					from: control.rotation,
					to: nextValue,
				});
				lastValue = nextValue;
				forceSpecificCursor(
					getRotationCursor(startCursorDegrees + cursorDelta),
				);
				setEffectDragOverrides(
					control.handle.nodePath,
					control.handle.effectIndex,
					field.fieldKey,
					field.propStatus.status === 'keyframed'
						? Internals.makeKeyframedDragOverride({
								status: field.propStatus,
								frame: control.handle.sourceFrame,
								value: nextValue,
							})
						: Internals.makeStaticDragOverride(nextValue),
				);
			};

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();
				const deltaX = moveEvent.clientX - startPointer.x;
				const deltaY = moveEvent.clientY - startPointer.y;
				if (!dragging) {
					if (!isSelectedOutlineDragPastThreshold({deltaX, deltaY})) {
						return;
					}

					dragging = true;
					onDraggingChange(true);
				}

				const nextAngle = getAngleDegrees(center, {
					x: moveEvent.clientX - svgRect.left,
					y: moveEvent.clientY - svgRect.top,
				});
				accumulatedDelta += getSelectedOutlineRotationDeltaDegrees({
					from: previousAngle,
					to: nextAngle,
				});
				previousAngle = nextAngle;
				rotationLocked = moveEvent.shiftKey;
				updateRotationDragOverride();
			};

			const onKeyChange = (keyEvent: KeyboardEvent) => {
				if (keyEvent.key !== 'Shift') {
					return;
				}

				const nextRotationLocked = keyEvent.type === 'keydown';
				if (nextRotationLocked === rotationLocked) {
					return;
				}

				rotationLocked = nextRotationLocked;
				if (dragging) {
					updateRotationDragOverride();
				}
			};

			const onPointerUp = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerUp);
				window.removeEventListener('keydown', onKeyChange);
				window.removeEventListener('keyup', onKeyChange);
				if (dragging) {
					stopForcingSpecificCursor();
					onDraggingChange(false);
				}

				saveNumericEffectField({
					clearEffectDragOverrides,
					clientId: control.handle.clientId,
					effectIndex: control.handle.effectIndex,
					field,
					lastValue,
					nodePath: control.handle.nodePath,
					schema: control.handle.schema,
					setPropStatuses,
					sourceFrame: control.handle.sourceFrame,
				});
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerUp);
			window.addEventListener('keydown', onKeyChange);
			window.addEventListener('keyup', onKeyChange);
		},
		[
			clearEffectDragOverrides,
			control,
			editorSnapping,
			field,
			onDraggingChange,
			rotationControl,
			setEffectDragOverrides,
			setPropStatuses,
		],
	);

	if (rotationControl === null || field === undefined) {
		return null;
	}

	const heightControl = control.resize.find((item) => item.axis === 'height');
	if (heightControl === undefined) {
		return null;
	}

	const connector = trimLineToCircleEdges({
		from: heightControl.position,
		fromRadius: ellipseControlRadius,
		to: rotationControl.position,
		toRadius: ellipseControlRadius,
	});

	return (
		<>
			<line
				x1={connector.from.x}
				y1={connector.from.y}
				x2={connector.to.x}
				y2={connector.to.y}
				stroke={BLUE}
				strokeWidth={2}
				vectorEffect="non-scaling-stroke"
				pointerEvents="none"
			/>
			<circle
				cx={rotationControl.position.x}
				cy={rotationControl.position.y}
				r={ellipseControlRadius}
				fill={WHITE}
				stroke={BLUE}
				strokeWidth={2}
				style={uvHandleStyle}
				vectorEffect="non-scaling-stroke"
				pointerEvents="all"
				cursor={getRotationCursor(
					getAngleDegrees(control.center, rotationControl.position),
				)}
				onPointerDown={onPointerDown}
			/>
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
	const {editorSnapping} = useContext(EditorSnappingContext);
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
				const snappedUv = editorSnapping
					? snapSelectedOutlineUv({
							point,
							points: outline.points,
							uv: rawUv,
						})
					: rawUv;
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
			editorSnapping,
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
			fill={WHITE}
			stroke={BLUE}
			strokeWidth={2}
			style={uvHandleStyle}
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
	const ellipseControls = useMemo(
		() =>
			getUvEllipseInteractiveControls({
				handles: target?.uvHandles ?? [],
				dimensions: outline.dimensions,
				points: outline.points,
			}),
		[outline.dimensions, outline.points, target?.uvHandles],
	);

	if (!target?.containsSelection || target.uvHandles.length === 0) {
		return null;
	}

	return (
		<>
			{ellipseControls.map((control) => (
				<React.Fragment
					key={`${control.handle.effectIndex}-${control.handle.fieldKey}-ellipse-controls`}
				>
					<SelectedUvEllipseStartHandle
						control={control}
						onDraggingChange={onDraggingChange}
						outline={outline}
					/>
					<SelectedUvEllipseResizeHandle
						axis="width"
						control={control}
						onDraggingChange={onDraggingChange}
						outline={outline}
					/>
					<SelectedUvEllipseResizeHandle
						axis="height"
						control={control}
						onDraggingChange={onDraggingChange}
						outline={outline}
					/>
					<SelectedUvEllipseRotationHandle
						control={control}
						onDraggingChange={onDraggingChange}
					/>
				</React.Fragment>
			))}
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
