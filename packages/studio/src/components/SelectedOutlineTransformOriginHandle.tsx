import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {BLUE, SELECTED_OUTLINE_DROP_SHADOW} from '../helpers/colors';
import {startCapturedPointerSession} from '../helpers/pointer-session';
import {EditorSnappingContext} from '../state/editor-snapping';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from './ForceSpecificCursor';
import {showNotification} from './Notifications/NotificationCenter';
import {
	applySelectedOutlineTransformOriginAxisLock,
	compensateTranslateForTransformOrigin,
	getSelectedOutlineTransformOriginDragChanges,
	getSelectedOutlineTransformOriginLockedAxis,
	snapSelectedOutlineTransformOriginUv,
	uvsEqual,
} from './selected-outline-drag';
import type {SelectedOutline} from './selected-outline-geometry';
import {getSelectedOutlineRotationPivot} from './selected-outline-measurement';
import {
	transformOriginFieldKey,
	translateFieldKey,
	type SelectedOutlineLayoutTarget,
	type SelectedOutlineTarget,
} from './selected-outline-types';
import {
	getUvCoordinateForPoint,
	getUvHandlePosition,
} from './selected-outline-uv';
import {callAddKeyframes} from './Timeline/call-add-keyframe';
import {saveSequenceProps} from './Timeline/save-sequence-prop';
import {parseCssRotation} from './Timeline/timeline-rotation-utils';
import {
	parseTranslate,
	serializeTranslate,
} from './Timeline/timeline-translate-utils';
import {
	parseTransformOrigin,
	parsedTransformOriginToUv,
	serializeTransformOrigin,
} from './Timeline/transform-origin-utils';

export const SelectedOutlineTransformOriginHandle: React.FC<{
	readonly getLatestTargetByKey: (
		key: string,
	) => SelectedOutlineTarget | undefined;
	readonly layoutTarget: SelectedOutlineLayoutTarget | undefined;
	readonly outline: SelectedOutline;
	readonly onDraggingChange: (dragging: boolean) => void;
}> = ({getLatestTargetByKey, layoutTarget, outline, onDraggingChange}) => {
	const {setDragOverrides, clearDragOverrides, setPropStatuses} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {editorSnapping} = useContext(EditorSnappingContext);
	const target =
		layoutTarget?.selectedForTransformOrigin ||
		layoutTarget?.selectedForRotation
			? getLatestTargetByKey(layoutTarget.key)
			: undefined;
	const transformOriginDrag = target?.transformOriginDrag ?? null;
	const transformOriginValue =
		transformOriginDrag?.originValue ??
		(layoutTarget?.selectedForRotation
			? layoutTarget.transformOriginValue
			: null);
	const crop = target?.crop;
	const transformOriginPoints = outline.uncroppedPoints ?? outline.points;

	const parsed = useMemo(
		() =>
			transformOriginValue === null
				? null
				: parseTransformOrigin(transformOriginValue),
		[transformOriginValue],
	);
	const uv = useMemo(() => {
		if (parsed === null || outline.dimensions === null) {
			return null;
		}

		return parsedTransformOriginToUv({
			parsed,
			width: outline.dimensions.width,
			height: outline.dimensions.height,
		});
	}, [outline.dimensions, parsed]);
	const position = useMemo(() => {
		if (layoutTarget?.selectedForRotation) {
			return getSelectedOutlineRotationPivot({
				dimensions: outline.dimensions,
				points: transformOriginPoints,
				transformOriginValue: layoutTarget.transformOriginValue,
			});
		}

		return uv === null ? null : getUvHandlePosition(transformOriginPoints, uv);
	}, [
		layoutTarget?.selectedForRotation,
		layoutTarget?.transformOriginValue,
		outline.dimensions,
		transformOriginPoints,
		uv,
	]);

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGGElement>) => {
			if (
				event.button !== 0 ||
				transformOriginDrag === null ||
				parsed === null ||
				uv === null ||
				outline.dimensions === null
			) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			const svg = event.currentTarget.ownerSVGElement;
			if (svg === null) {
				return;
			}

			const rotation = parseCssRotation(transformOriginDrag.rotateValue);
			if (rotation === null) {
				return;
			}

			const {dimensions} = outline;
			if (dimensions === null) {
				return;
			}

			const scale = NoReactInternals.parseScaleValue(
				transformOriginDrag.scaleValue,
			);
			const startTranslate = parseTranslate(transformOriginDrag.translateValue);
			const svgRect = svg.getBoundingClientRect();

			let last: {
				readonly uv: readonly [number, number];
				readonly origin: string;
				readonly translate: string;
			} | null = null;
			let currentPointerX = event.clientX;
			let currentPointerY = event.clientY;
			let axisLocked = event.shiftKey;

			onDraggingChange(true);
			forceSpecificCursor('crosshair');

			const updateFromPointerPosition = () => {
				const point = {
					x: currentPointerX - svgRect.left,
					y: currentPointerY - svgRect.top,
				};
				const rawUv = getUvCoordinateForPoint(transformOriginPoints, point);
				const lockedAxis = getSelectedOutlineTransformOriginLockedAxis({
					axisLocked,
					dimensions,
					startUv: uv,
					uv: rawUv,
				});
				const axisLockedUv = applySelectedOutlineTransformOriginAxisLock({
					lockedAxis,
					startUv: uv,
					uv: rawUv,
				});
				const snapPoint =
					lockedAxis === null
						? point
						: getUvHandlePosition(transformOriginPoints, axisLockedUv);
				const snappedUv = editorSnapping
					? snapSelectedOutlineTransformOriginUv({
							crop: crop ?? null,
							point: snapPoint,
							points: transformOriginPoints,
							thresholdPx: null,
							uv: axisLockedUv,
						})
					: axisLockedUv;
				const nextUv = applySelectedOutlineTransformOriginAxisLock({
					lockedAxis,
					startUv: uv,
					uv: snappedUv,
				});
				const deltaOrigin = [
					(nextUv[0] - uv[0]) * dimensions.width,
					(nextUv[1] - uv[1]) * dimensions.height,
				] as const;
				const [nextTranslateX, nextTranslateY] =
					compensateTranslateForTransformOrigin({
						startTranslate: [startTranslate[0], startTranslate[1]],
						deltaOrigin,
						rotation,
						scale,
					});
				const origin = serializeTransformOrigin({
					uv: nextUv,
					z: parsed.z,
				});
				const translate = serializeTranslate([
					nextTranslateX,
					nextTranslateY,
					startTranslate[2],
				]);
				last = {uv: nextUv, origin, translate};

				setDragOverrides(
					transformOriginDrag.nodePath,
					transformOriginFieldKey,
					transformOriginDrag.originPropStatus.status === 'keyframed'
						? Internals.makeKeyframedDragOverride({
								status: transformOriginDrag.originPropStatus,
								frame: transformOriginDrag.sourceFrame,
								value: origin,
							})
						: Internals.makeStaticDragOverride(origin),
				);
				setDragOverrides(
					transformOriginDrag.nodePath,
					translateFieldKey,
					transformOriginDrag.translatePropStatus.status === 'keyframed'
						? transformOriginDrag.originPropStatus.status === 'keyframed'
							? Internals.makeKeyframedDragOverride({
									status: transformOriginDrag.translatePropStatus,
									frame: transformOriginDrag.sourceFrame,
									value: translate,
								})
							: {
									type: 'keyframed',
									status: {
										...transformOriginDrag.translatePropStatus,
										keyframes:
											transformOriginDrag.translatePropStatus.keyframes.map(
												(keyframe) => {
													const keyframeTranslate = parseTranslate(
														String(keyframe.value),
													);
													return {
														...keyframe,
														value: serializeTranslate([
															keyframeTranslate[0] +
																nextTranslateX -
																startTranslate[0],
															keyframeTranslate[1] +
																nextTranslateY -
																startTranslate[1],
															keyframeTranslate[2],
														]),
													};
												},
											),
									},
									sourceFrame: transformOriginDrag.sourceFrame,
								}
						: Internals.makeStaticDragOverride(translate),
				);
			};

			updateFromPointerPosition();

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();
				currentPointerX = moveEvent.clientX;
				currentPointerY = moveEvent.clientY;
				axisLocked = moveEvent.shiftKey;
				updateFromPointerPosition();
			};

			const onKeyChange = (keyEvent: KeyboardEvent) => {
				if (keyEvent.key !== 'Shift') {
					return;
				}

				const nextAxisLocked = keyEvent.type === 'keydown';
				if (nextAxisLocked === axisLocked) {
					return;
				}

				axisLocked = nextAxisLocked;
				updateFromPointerPosition();
			};

			const onPointerUp = () => {
				window.removeEventListener('keydown', onKeyChange);
				window.removeEventListener('keyup', onKeyChange);
				stopForcingSpecificCursor();
				onDraggingChange(false);

				if (last === null || uvsEqual(last.uv, uv)) {
					clearDragOverrides(transformOriginDrag.nodePath);
					return;
				}

				const {staticChanges, keyframedChanges} =
					getSelectedOutlineTransformOriginDragChanges({
						target: transformOriginDrag,
						startTranslate,
						origin: last.origin,
						translate: last.translate,
					});
				if (staticChanges.length === 0 && keyframedChanges.length === 0) {
					clearDragOverrides(transformOriginDrag.nodePath);
					return;
				}

				const promise =
					staticChanges.length === 0
						? callAddKeyframes({
								sequenceKeyframes: keyframedChanges,
								effectKeyframes: [],
								setPropStatuses,
								clientId: transformOriginDrag.clientId,
							})
						: saveSequenceProps({
								changes: staticChanges,
								addedKeyframes: keyframedChanges,
								movedKeyframes: null,
								setPropStatuses,
								clientId: transformOriginDrag.clientId,
								undoLabel: 'Move transform origin',
								redoLabel: 'Move transform origin back',
							});

				promise
					.catch((err) => {
						showNotification(
							`Could not save transform origin: ${
								err instanceof Error ? err.message : String(err)
							}`,
							4000,
						);
					})
					.finally(() => {
						clearDragOverrides(transformOriginDrag.nodePath);
					});
			};

			startCapturedPointerSession({
				event,
				captureTarget: event.currentTarget,
				onMove: onPointerMove,
				onEnd: onPointerUp,
			});
			window.addEventListener('keydown', onKeyChange);
			window.addEventListener('keyup', onKeyChange);
		},
		[
			clearDragOverrides,
			crop,
			editorSnapping,
			onDraggingChange,
			outline,
			parsed,
			setDragOverrides,
			setPropStatuses,
			transformOriginDrag,
			transformOriginPoints,
			uv,
		],
	);

	if (position === null) {
		return null;
	}

	return (
		<g
			data-remotion-studio-transform-origin-handle
			pointerEvents={transformOriginDrag === null ? 'none' : 'all'}
			cursor={transformOriginDrag === null ? undefined : 'crosshair'}
			onPointerDown={onPointerDown}
			aria-hidden="true"
			style={{
				filter: SELECTED_OUTLINE_DROP_SHADOW,
			}}
		>
			<circle
				cx={position.x}
				cy={position.y}
				r={4}
				stroke={BLUE}
				fill="none"
				strokeWidth={2}
				vectorEffect="non-scaling-stroke"
			/>
			<line
				x1={position.x - 8}
				y1={position.y}
				x2={position.x + 8}
				y2={position.y}
				stroke={BLUE}
				strokeWidth={2}
				vectorEffect="non-scaling-stroke"
			/>
			<line
				x1={position.x}
				y1={position.y - 8}
				x2={position.x}
				y2={position.y + 8}
				stroke={BLUE}
				strokeWidth={2}
				vectorEffect="non-scaling-stroke"
			/>
		</g>
	);
};
