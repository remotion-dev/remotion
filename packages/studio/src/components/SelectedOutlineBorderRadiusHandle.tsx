import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {BLUE, SELECTED_OUTLINE_DROP_SHADOW} from '../helpers/colors';
import {startCapturedPointerSession} from '../helpers/pointer-session';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from './ForceSpecificCursor';
import {showNotification} from './Notifications/NotificationCenter';
import {
	clearSelectedOutlineBorderRadiusDragOverrides,
	getSelectedOutlineBorderRadiusDragChanges,
	getSelectedOutlineBorderRadiusDragStates,
	isSelectedOutlineDragPastThreshold,
} from './selected-outline-drag';
import type {SelectedOutline} from './selected-outline-geometry';
import {borderRadiusFieldKey} from './selected-outline-types';
import type {SelectedOutlineBorderRadiusDragTarget} from './selected-outline-types';
import {svgPointToClientPoint} from './svg-point-to-client-point';
import {callAddKeyframes} from './Timeline/call-add-keyframe';
import {getCurrentFrame} from './Timeline/imperative-state';
import {saveSequenceProps} from './Timeline/save-sequence-prop';

const MIN_RADIUS = 0;

export const SelectedOutlineBorderRadiusHandle: React.FC<{
	readonly handlePoint: {readonly x: number; readonly y: number};
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly outline: SelectedOutline;
	readonly radius: number;
	readonly target: SelectedOutlineBorderRadiusDragTarget | null;
}> = ({handlePoint, onDraggingChange, outline, radius, target}) => {
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);

	const borderRadiusDrag = target ?? null;

	const handlePosition = useMemo(() => {
		const points = outline.uncroppedPoints ?? outline.points;
		// The handle sits just inside the top-left corner; distance from the
		// pointer to the top-left corner maps to the radius.
		return points[0];
	}, [outline.uncroppedPoints, outline.points]);

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGGElement>) => {
			if (event.button !== 0 || borderRadiusDrag === null) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			const svg = event.currentTarget.ownerSVGElement;
			if (svg === null) {
				return;
			}

			const corner = svgPointToClientPoint(
				handlePosition,
				svg.getBoundingClientRect(),
			);
			const anchor = corner;

			const dragStates = getSelectedOutlineBorderRadiusDragStates({
				dragTargets: [borderRadiusDrag],
				getDragOverrides,
				timelinePosition: getCurrentFrame(),
			});

			let lastValue = new Map<string, number>();
			let dragStarted = false;
			let currentClientX = event.clientX;
			let currentClientY = event.clientY;

			const clampRadius = (value: number) => {
				const max =
					borderRadiusDrag.fieldSchema.max ?? Number.POSITIVE_INFINITY;
				return Math.max(MIN_RADIUS, Math.min(value, max));
			};

			const updateBorderRadiusOverrides = () => {
				const distance = Math.hypot(
					currentClientX - anchor.x,
					currentClientY - anchor.y,
				);
				const nextRadius = clampRadius(distance);
				lastValue = new Map(
					dragStates.map((dragState) => [dragState.key, nextRadius]),
				);

				forceSpecificCursor('ns-resize');

				for (const dragState of dragStates) {
					const value = lastValue.get(dragState.key);
					if (value === undefined) {
						continue;
					}

					if (dragState.target.propStatus.status === 'keyframed') {
						setDragOverrides(
							dragState.target.nodePath,
							borderRadiusFieldKey,
							Internals.makeKeyframedDragOverride({
								status: dragState.target.propStatus,
								frame: dragState.sourceFrame,
								value,
							}),
						);
					} else {
						setDragOverrides(
							dragState.target.nodePath,
							borderRadiusFieldKey,
							Internals.makeStaticDragOverride(value),
						);
					}
				}
			};

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();
				const deltaX = moveEvent.clientX - event.clientX;
				const deltaY = moveEvent.clientY - event.clientY;
				if (!dragStarted) {
					if (
						!isSelectedOutlineDragPastThreshold({
							deltaX,
							deltaY,
						})
					) {
						return;
					}

					dragStarted = true;
					onDraggingChange(true);
				}

				currentClientX = moveEvent.clientX;
				currentClientY = moveEvent.clientY;
				updateBorderRadiusOverrides();
			};

			const onPointerUp = () => {
				if (dragStarted) {
					stopForcingSpecificCursor();
					onDraggingChange(false);
				}

				const changes = getSelectedOutlineBorderRadiusDragChanges({
					dragStates,
					lastValues: lastValue,
				});

				if (changes.length === 0) {
					clearSelectedOutlineBorderRadiusDragOverrides({
						clearDragOverrides,
						dragStates,
					});
					return;
				}

				const staticChanges = changes.filter(
					(change): change is Extract<typeof change, {type: 'static'}> =>
						change.type === 'static',
				);
				const keyframedChanges = changes.filter(
					(change): change is Extract<typeof change, {type: 'keyframed'}> =>
						change.type === 'keyframed',
				);

				Promise.all([
					staticChanges.length > 0
						? saveSequenceProps({
								changes: staticChanges,
								addedKeyframes: null,
								movedKeyframes: null,
								setPropStatuses,
								clientId: borderRadiusDrag.clientId,
								undoLabel: 'Change border radius',
								redoLabel: 'Change border radius back',
							})
						: Promise.resolve(),
					keyframedChanges.length > 0
						? callAddKeyframes({
								sequenceKeyframes: keyframedChanges,
								effectKeyframes: [],
								setPropStatuses,
								clientId: borderRadiusDrag.clientId,
							})
						: Promise.resolve(),
				])
					.catch((err) => {
						showNotification(
							`Could not save border radius: ${
								err instanceof Error ? err.message : String(err)
							}`,
							4000,
						);
					})
					.finally(() => {
						clearSelectedOutlineBorderRadiusDragOverrides({
							clearDragOverrides,
							dragStates,
						});
					});
			};

			startCapturedPointerSession({
				event,
				captureTarget: event.currentTarget,
				onMove: onPointerMove,
				onEnd: onPointerUp,
			});
		},
		[
			borderRadiusDrag,
			clearDragOverrides,
			getDragOverrides,
			handlePosition,
			onDraggingChange,
			setDragOverrides,
			setPropStatuses,
		],
	);

	if (borderRadiusDrag === null) {
		return null;
	}

	return (
		<g
			data-remotion-studio-border-radius-handle
			pointerEvents="all"
			cursor="ns-resize"
			onPointerDown={onPointerDown}
			aria-hidden="true"
			style={{
				filter: SELECTED_OUTLINE_DROP_SHADOW,
			}}
		>
			<circle
				cx={handlePoint.x}
				cy={handlePoint.y}
				r={radius / 2}
				stroke={BLUE}
				fill="none"
				strokeWidth={2}
				vectorEffect="non-scaling-stroke"
			/>
		</g>
	);
};
