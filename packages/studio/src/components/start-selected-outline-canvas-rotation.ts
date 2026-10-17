import type React from 'react';
import type {GetDragOverrides} from 'remotion';
import {Internals} from 'remotion';
import {startCapturedPointerSession} from '../helpers/pointer-session';
import {canvasRotationCursor} from './canvas-rotation-cursor';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from './ForceSpecificCursor';
import {showNotification} from './Notifications/NotificationCenter';
import {
	clearSelectedOutlineDragOverrides,
	getSelectedOutline3DRotationDragValues,
	getSelectedOutlineRotationDragChanges,
	getSelectedOutlineRotationDragStates,
	getSelectedOutlineRotationDragValues,
	isSelectedOutlineDragPastThreshold,
	snapSelectedOutlineRotationDeltaDegrees,
	type SelectedOutlineKeyframedDragChange,
	type SelectedOutlineStaticDragChange,
} from './selected-outline-drag';
import type {SelectedOutline} from './selected-outline-geometry';
import {
	getAngleDegrees,
	getRotationCursor,
	getSelectedOutlineRotationDeltaDegrees,
	getSelectedOutlineRotationPivot,
} from './selected-outline-measurement';
import {
	rotateFieldKey,
	type SelectedOutlineRotationDragTarget,
} from './selected-outline-types';
import {svgPointToClientPoint} from './svg-point-to-client-point';
import {commitPendingInspectorFields} from './Timeline/focus-inspector-field';
import {getCurrentFrame} from './Timeline/imperative-state';
import {saveSequenceProps} from './Timeline/save-sequence-prop';

const rotationDegreesPerPixel = 0.5;
const canvas2DRotationCursor = getRotationCursor(0);

type VisualModeSetters = React.ContextType<
	typeof Internals.VisualModeSettersContext
>;

export const startSelectedOutlineCanvasRotation = ({
	event,
	outline,
	rotationDrag,
	editorSnapping,
	getDragOverrides,
	setDragOverrides,
	clearDragOverrides,
	setPropStatuses,
	onDraggingChange,
}: {
	readonly event: React.PointerEvent<SVGElement>;
	readonly outline: SelectedOutline;
	readonly rotationDrag: SelectedOutlineRotationDragTarget;
	readonly editorSnapping: boolean;
	readonly getDragOverrides: GetDragOverrides;
	readonly setDragOverrides: VisualModeSetters['setDragOverrides'];
	readonly clearDragOverrides: VisualModeSetters['clearDragOverrides'];
	readonly setPropStatuses: VisualModeSetters['setPropStatuses'];
	readonly onDraggingChange: (dragging: boolean) => void;
}): void => {
	event.preventDefault();
	event.stopPropagation();
	if (commitPendingInspectorFields()) {
		return;
	}

	const svg = event.currentTarget.ownerSVGElement;
	if (svg === null) {
		return;
	}

	const previousSvgCursor = svg.style.cursor;
	const dragCursor = rotationDrag.transform3DMode
		? canvasRotationCursor
		: canvas2DRotationCursor;
	svg.style.cursor = dragCursor;

	const startPointer = {x: event.clientX, y: event.clientY};
	const center = svgPointToClientPoint(
		getSelectedOutlineRotationPivot({
			dimensions: outline.dimensions,
			points: outline.uncroppedPoints ?? outline.points,
			transformOriginValue: rotationDrag.transformOriginValue,
		}),
		svg.getBoundingClientRect(),
	);
	const dragStates = getSelectedOutlineRotationDragStates({
		dragTargets: [rotationDrag],
		getDragOverrides,
		timelinePosition: getCurrentFrame(),
	});
	let previousAngle = getAngleDegrees(center, startPointer);
	let accumulatedDelta = 0;
	let lastValues = new Map<string, string>();
	let dragStarted = false;

	const onPointerMove = (moveEvent: PointerEvent) => {
		moveEvent.preventDefault();
		const screenDeltaX = moveEvent.clientX - startPointer.x;
		const screenDeltaY = moveEvent.clientY - startPointer.y;
		if (!dragStarted) {
			if (
				!isSelectedOutlineDragPastThreshold({
					deltaX: screenDeltaX,
					deltaY: screenDeltaY,
				})
			) {
				return;
			}

			dragStarted = true;
			forceSpecificCursor(dragCursor);
			onDraggingChange(true);
		}

		if (rotationDrag.transform3DMode) {
			const startRotation = dragStates[0]?.startRotation ?? [0, 0, 0];
			let rotationXDeltaDegrees = -screenDeltaY * rotationDegreesPerPixel;
			let rotationYDeltaDegrees = screenDeltaX * rotationDegreesPerPixel;
			if (moveEvent.shiftKey && editorSnapping) {
				rotationXDeltaDegrees =
					Math.round((startRotation[0] + rotationXDeltaDegrees) / 15) * 15 -
					startRotation[0];
				rotationYDeltaDegrees =
					Math.round((startRotation[1] + rotationYDeltaDegrees) / 15) * 15 -
					startRotation[1];
			}

			lastValues = getSelectedOutline3DRotationDragValues({
				dragStates,
				rotationXDeltaDegrees,
				rotationYDeltaDegrees,
			});
		} else {
			const nextAngle = getAngleDegrees(center, {
				x: moveEvent.clientX,
				y: moveEvent.clientY,
			});
			accumulatedDelta += getSelectedOutlineRotationDeltaDegrees({
				from: previousAngle,
				to: nextAngle,
			});
			previousAngle = nextAngle;
			const rotationDeltaDegrees =
				moveEvent.shiftKey && editorSnapping
					? snapSelectedOutlineRotationDeltaDegrees({
							dragStates,
							rotationDeltaDegrees: accumulatedDelta,
						})
					: accumulatedDelta;
			lastValues = getSelectedOutlineRotationDragValues({
				dragStates,
				rotationDeltaDegrees,
			});
		}

		for (const dragState of dragStates) {
			const value = lastValues.get(dragState.key);
			if (value === undefined) {
				throw new Error('Expected rotation drag value to be available');
			}

			if (dragState.target.propStatus.status === 'keyframed') {
				setDragOverrides(
					dragState.target.nodePath,
					rotateFieldKey,
					Internals.makeKeyframedDragOverride({
						status: dragState.target.propStatus,
						frame: dragState.sourceFrame,
						value,
					}),
				);
			} else {
				setDragOverrides(
					dragState.target.nodePath,
					rotateFieldKey,
					Internals.makeStaticDragOverride(value),
				);
			}
		}
	};

	const onPointerUp = () => {
		svg.style.cursor = previousSvgCursor;
		if (dragStarted) {
			stopForcingSpecificCursor();
			onDraggingChange(false);
		}

		const changes = getSelectedOutlineRotationDragChanges({
			dragStates,
			lastValues,
		});
		if (changes.length === 0) {
			clearSelectedOutlineDragOverrides({
				clearDragOverrides,
				dragStates,
			});
			return;
		}

		const staticChanges = changes.filter(
			(change): change is SelectedOutlineStaticDragChange =>
				change.type === 'static',
		);
		const keyframedChanges = changes.filter(
			(change): change is SelectedOutlineKeyframedDragChange =>
				change.type === 'keyframed',
		);

		saveSequenceProps({
			changes: staticChanges,
			addedKeyframes: keyframedChanges,
			movedKeyframes: null,
			setPropStatuses,
			clientId: rotationDrag.clientId,
			undoLabel: 'Rotate sequence',
			redoLabel: 'Rotate sequence back',
		})
			.catch((error) => {
				showNotification(
					`Could not save sequence props: ${
						error instanceof Error ? error.message : String(error)
					}`,
					4000,
				);
			})
			.finally(() => {
				clearSelectedOutlineDragOverrides({
					clearDragOverrides,
					dragStates,
				});
			});
	};

	// The polygon gates pointer-down, while the stable overlay keeps the
	// session alive after the pointer leaves the selected item.
	startCapturedPointerSession({
		event,
		captureTarget: svg,
		onMove: onPointerMove,
		onEnd: onPointerUp,
	});
};
