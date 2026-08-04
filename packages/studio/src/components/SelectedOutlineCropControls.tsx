import React, {useContext, useLayoutEffect, useMemo} from 'react';
import {Internals} from 'remotion';
import {
	BLUE,
	SELECTED_OUTLINE_DROP_SHADOW,
	TRANSPARENT,
} from '../helpers/colors';
import {startPointerSession} from '../helpers/pointer-session';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from './ForceSpecificCursor';
import {showNotification} from './Notifications/NotificationCenter';
import {
	getSelectedOutlineCropDragChanges,
	getSelectedOutlineCropDragValues,
	getSelectedOutlineCropFollowingTransformOrigin,
	type SelectedOutlineCropValues,
	type SelectedOutlineKeyframedDragChange,
	type SelectedOutlineStaticDragChange,
} from './selected-outline-drag';
import type {OutlinePoint, SelectedOutline} from './selected-outline-geometry';
import {
	midpoint,
	vectorBetween,
	vectorLength,
} from './selected-outline-measurement';
import {
	cropFieldKeys,
	transformOriginFieldKey,
	type SelectedOutlineCropHandle,
	type SelectedOutlineTarget,
} from './selected-outline-types';
import {getUvCoordinateForPoint} from './selected-outline-uv';
import {callAddKeyframes} from './Timeline/call-add-keyframe';
import {commitPendingInspectorFields} from './Timeline/focus-inspector-field';
import {saveSequenceProps} from './Timeline/save-sequence-prop';

const CROP_HANDLE_THICKNESS = 5;
const CROP_HANDLE_LENGTH = 20;
const CROP_HANDLE_HIT_WIDTH = 14;
const CROPPED_AWAY_OPACITY = 0.35;

const cropHandles: readonly SelectedOutlineCropHandle[] = [
	'top-left',
	'top-right',
	'bottom-left',
	'bottom-right',
	'top',
	'right',
	'bottom',
	'left',
];

const cursorForHandle = (
	handle: SelectedOutlineCropHandle,
): React.CSSProperties['cursor'] => {
	if (handle === 'top' || handle === 'bottom') {
		return 'ns-resize';
	}

	if (handle === 'left' || handle === 'right') {
		return 'ew-resize';
	}

	return handle === 'top-left' || handle === 'bottom-right'
		? 'nwse-resize'
		: 'nesw-resize';
};

const moveTowards = (
	from: OutlinePoint,
	to: OutlinePoint,
	distance: number,
): OutlinePoint => {
	const vector = vectorBetween(from, to);
	const length = vectorLength(vector);
	if (length === 0) {
		return from;
	}

	const progress = Math.min(1, distance / length);
	return {
		x: from.x + vector.x * progress,
		y: from.y + vector.y * progress,
	};
};

const pointString = (point: OutlinePoint) => `${point.x} ${point.y}`;

const getCropHandlePath = ({
	handle,
	points,
}: {
	readonly handle: SelectedOutlineCropHandle;
	readonly points: SelectedOutline['points'];
}): string => {
	const [topLeft, topRight, bottomRight, bottomLeft] = points;
	const cornerInfo = {
		'top-left': {corner: topLeft, first: topRight, second: bottomLeft},
		'top-right': {corner: topRight, first: topLeft, second: bottomRight},
		'bottom-left': {corner: bottomLeft, first: topLeft, second: bottomRight},
		'bottom-right': {corner: bottomRight, first: topRight, second: bottomLeft},
	} as const;

	if (handle in cornerInfo) {
		const info = cornerInfo[handle as keyof typeof cornerInfo];
		const length = Math.min(
			CROP_HANDLE_LENGTH,
			vectorLength(vectorBetween(info.corner, info.first)) / 4,
			vectorLength(vectorBetween(info.corner, info.second)) / 4,
		);
		const first = moveTowards(info.corner, info.first, length);
		const second = moveTowards(info.corner, info.second, length);
		return `M ${pointString(first)} L ${pointString(info.corner)} L ${pointString(second)}`;
	}

	const edgeInfo = {
		top: [topLeft, topRight],
		right: [topRight, bottomRight],
		bottom: [bottomLeft, bottomRight],
		left: [topLeft, bottomLeft],
	} as const;
	const [start, end] = edgeInfo[handle as keyof typeof edgeInfo];
	const center = midpoint(start, end);
	const halfLength = Math.min(
		CROP_HANDLE_LENGTH / 2,
		vectorLength(vectorBetween(start, end)) / 8,
	);
	const pathStart = moveTowards(center, start, halfLength);
	const pathEnd = moveTowards(center, end, halfLength);
	return `M ${pointString(pathStart)} L ${pointString(pathEnd)}`;
};

const getCropValues = (
	target: NonNullable<SelectedOutlineTarget['cropDrag']>,
): SelectedOutlineCropValues => ({
	cropLeft: target.fields.cropLeft.value,
	cropRight: target.fields.cropRight.value,
	cropTop: target.fields.cropTop.value,
	cropBottom: target.fields.cropBottom.value,
});

const makeCropPreviewMask = (crop: SelectedOutlineTarget['crop']): string => {
	const x = crop.left * 100;
	const y = crop.top * 100;
	const width = Math.max(0, 1 - crop.left - crop.right) * 100;
	const height = Math.max(0, 1 - crop.top - crop.bottom) * 100;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" viewBox="0 0 100 100" preserveAspectRatio="none"><rect width="100" height="100" fill="white" fill-opacity="${CROPPED_AWAY_OPACITY}"/><rect x="${x}" y="${y}" width="${width}" height="${height}" fill="white"/></svg>`;
	return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

const cropPreviewAttribute = 'data-remotion-studio-crop-preview';
let cropPreviewId = 0;

const useCropPreview = (target: SelectedOutlineTarget | undefined) => {
	useLayoutEffect(() => {
		if (target === undefined || target.cropDrag === null) {
			return;
		}

		const element = target.ref.current;
		if (!(element instanceof HTMLElement || element instanceof SVGElement)) {
			return;
		}

		const mask = makeCropPreviewMask(target.crop);
		const previewId = String(++cropPreviewId);
		const styleElement = element.ownerDocument.createElement('style');
		styleElement.textContent = `
[${cropPreviewAttribute}="${previewId}"] {
	clip-path: none !important;
	mask-image: ${mask} !important;
	-webkit-mask-image: ${mask} !important;
	mask-position: 0 0 !important;
	-webkit-mask-position: 0 0 !important;
	mask-repeat: no-repeat !important;
	-webkit-mask-repeat: no-repeat !important;
	mask-size: 100% 100% !important;
	-webkit-mask-size: 100% 100% !important;
}`;

		// Do not mutate the inline crop style: React would still consider its
		// clipPath prop applied and may not restore it when crop mode is closed.
		element.setAttribute(cropPreviewAttribute, previewId);
		(
			element.ownerDocument.head ?? element.ownerDocument.documentElement
		).append(styleElement);

		return () => {
			if (element.getAttribute(cropPreviewAttribute) === previewId) {
				element.removeAttribute(cropPreviewAttribute);
			}

			styleElement.remove();
		};
	}, [target]);
};

const CropHandle: React.FC<{
	readonly handle: SelectedOutlineCropHandle;
	readonly outline: SelectedOutline;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly target: SelectedOutlineTarget;
}> = ({handle, outline, onDraggingChange, target}) => {
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {cropDrag} = target;
	const cursor = cursorForHandle(handle);
	const path = useMemo(
		() => getCropHandlePath({handle, points: outline.points}),
		[handle, outline.points],
	);

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGPathElement>) => {
			if (event.button !== 0 || cropDrag === null) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			if (commitPendingInspectorFields()) {
				return;
			}

			const svg = event.currentTarget.ownerSVGElement;
			if (svg === null) {
				return;
			}

			const svgRect = svg.getBoundingClientRect();
			const uncroppedPoints = outline.uncroppedPoints ?? outline.points;
			const initialValues = getCropValues(cropDrag);
			let lastValues = initialValues;
			let dragStarted = false;

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();
				if (!dragStarted) {
					dragStarted = true;
					onDraggingChange(true);
					forceSpecificCursor(cursor ?? 'default');
				}

				const uv = getUvCoordinateForPoint(uncroppedPoints, {
					x: moveEvent.clientX - svgRect.left,
					y: moveEvent.clientY - svgRect.top,
				});
				lastValues = getSelectedOutlineCropDragValues({
					crop: initialValues,
					dimensions: outline.dimensions,
					handle,
					uv,
				});
				const transformOrigin = getSelectedOutlineCropFollowingTransformOrigin({
					dimensions: outline.dimensions,
					initialCrop: initialValues,
					nextCrop: lastValues,
					transformOrigin: cropDrag.transformOrigin,
				});

				for (const fieldKey of Object.values(cropFieldKeys)) {
					const field = cropDrag.fields[fieldKey];
					const value = lastValues[fieldKey];
					if (value === field.value) {
						continue;
					}

					setDragOverrides(
						cropDrag.nodePath,
						fieldKey,
						field.propStatus.status === 'keyframed'
							? Internals.makeKeyframedDragOverride({
									status: field.propStatus,
									frame: cropDrag.sourceFrame,
									value,
								})
							: Internals.makeStaticDragOverride(value),
					);
				}

				if (transformOrigin !== null) {
					setDragOverrides(
						cropDrag.nodePath,
						transformOriginFieldKey,
						Internals.makeStaticDragOverride(transformOrigin),
					);
				}
			};

			const onPointerUp = () => {
				if (dragStarted) {
					stopForcingSpecificCursor();
					onDraggingChange(false);
				}

				const changes = getSelectedOutlineCropDragChanges({
					dimensions: outline.dimensions,
					target: cropDrag,
					values: lastValues,
				});
				const staticChanges = changes.filter(
					(change): change is SelectedOutlineStaticDragChange =>
						change.type === 'static',
				);
				const keyframedChanges = changes.filter(
					(change): change is SelectedOutlineKeyframedDragChange =>
						change.type === 'keyframed',
				);

				const promise =
					staticChanges.length === 0
						? callAddKeyframes({
								sequenceKeyframes: keyframedChanges,
								effectKeyframes: [],
								setPropStatuses,
								clientId: cropDrag.clientId,
							})
						: saveSequenceProps({
								changes: staticChanges,
								addedKeyframes: keyframedChanges,
								movedKeyframes: null,
								setPropStatuses,
								clientId: cropDrag.clientId,
								undoLabel: 'Crop sequence',
								redoLabel: 'Crop sequence back',
							});

				promise
					.catch((err) => {
						showNotification(
							`Could not save crop: ${
								err instanceof Error ? err.message : String(err)
							}`,
							4000,
						);
					})
					.finally(() => {
						clearDragOverrides(cropDrag.nodePath);
					});
			};

			startPointerSession({
				event,
				target: event.currentTarget,
				onMove: onPointerMove,
				onEnd: onPointerUp,
			});
		},
		[
			clearDragOverrides,
			cropDrag,
			cursor,
			handle,
			onDraggingChange,
			outline.dimensions,
			outline.points,
			outline.uncroppedPoints,
			setDragOverrides,
			setPropStatuses,
		],
	);

	return (
		<>
			<path
				d={path}
				fill="none"
				stroke={TRANSPARENT}
				strokeWidth={CROP_HANDLE_HIT_WIDTH}
				strokeLinejoin="miter"
				vectorEffect="non-scaling-stroke"
				pointerEvents="stroke"
				cursor={cursor}
				onPointerDown={onPointerDown}
			/>
			<path
				d={path}
				fill="none"
				stroke={BLUE}
				strokeWidth={CROP_HANDLE_THICKNESS}
				strokeLinejoin="miter"
				strokeLinecap="butt"
				vectorEffect="non-scaling-stroke"
				pointerEvents="none"
				style={{filter: SELECTED_OUTLINE_DROP_SHADOW}}
			/>
		</>
	);
};

export const SelectedOutlineCropControls: React.FC<{
	readonly outline: SelectedOutline;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly target: SelectedOutlineTarget | undefined;
}> = ({outline, onDraggingChange, target}) => {
	useCropPreview(target);

	if (target?.cropDrag === null || target?.cropDrag === undefined) {
		return null;
	}

	return (
		<g aria-hidden="true">
			{cropHandles.map((handle) => (
				<CropHandle
					key={handle}
					handle={handle}
					outline={outline}
					onDraggingChange={onDraggingChange}
					target={target}
				/>
			))}
		</g>
	);
};
