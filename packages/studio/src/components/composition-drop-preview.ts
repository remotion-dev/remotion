import type {PreviewSize} from 'remotion';
import {calculateStudioScale} from '../helpers/studio-fit-padding';
import type {Guide} from '../state/editor-guides';
import {
	getCompositionPositionForDrop,
	type InsertElementDropPosition,
} from './import-assets';
import type {SelectedOutline} from './selected-outline-geometry';
import {
	findSelectedOutlineSnap,
	getSelectedOutlineSnapTargets,
	type SelectedOutlineSnapPoint,
} from './selected-outline-snap';

type Dimensions = {
	readonly width: number;
	readonly height: number;
};

type CanvasSize = {
	readonly width: number;
	readonly height: number;
};

export type CompositionDropPreview = {
	readonly compositionDimensions: Dimensions;
	readonly dropPosition: InsertElementDropPosition;
	readonly snapPoints: readonly SelectedOutlineSnapPoint[];
};

export type CompositionDropPreviewBox = {
	readonly left: number;
	readonly top: number;
	readonly width: number;
	readonly height: number;
};

export const snapCompositionDropPosition = ({
	compositionDimensions,
	destinationDimensions,
	dropPosition,
	guides,
	scale,
}: {
	readonly compositionDimensions: Dimensions;
	readonly destinationDimensions: Dimensions;
	readonly dropPosition: InsertElementDropPosition;
	readonly guides: readonly Guide[];
	readonly scale: number;
}): {
	readonly dropPosition: InsertElementDropPosition;
	readonly snapPoints: readonly SelectedOutlineSnapPoint[];
} => {
	const left = dropPosition.centerX - compositionDimensions.width / 2;
	const top = dropPosition.centerY - compositionDimensions.height / 2;
	const right = left + compositionDimensions.width;
	const bottom = top + compositionDimensions.height;
	const outline: SelectedOutline = {
		key: 'composition-drop-preview',
		dimensions: compositionDimensions,
		uncroppedPoints: null,
		pathPoints: null,
		points: [
			{x: left * scale, y: top * scale},
			{x: right * scale, y: top * scale},
			{x: right * scale, y: bottom * scale},
			{x: left * scale, y: bottom * scale},
		],
	};
	const snap = findSelectedOutlineSnap({
		allowX: true,
		allowY: true,
		deltaX: 0,
		deltaY: 0,
		outlines: [outline],
		scale,
		targets: getSelectedOutlineSnapTargets({
			compositionHeight: destinationDimensions.height,
			compositionWidth: destinationDimensions.width,
			guides,
		}),
	});

	return {
		dropPosition: {
			centerX: dropPosition.centerX + (snap.snapOffsetX ?? 0),
			centerY: dropPosition.centerY + (snap.snapOffsetY ?? 0),
		},
		snapPoints: snap.activeSnapPoints,
	};
};

export const getCompositionDropPreviewBox = ({
	canvasSize,
	destinationDimensions,
	preview,
	previewSize,
}: {
	readonly canvasSize: CanvasSize;
	readonly destinationDimensions: Dimensions;
	readonly preview: CompositionDropPreview;
	readonly previewSize: PreviewSize;
}): CompositionDropPreviewBox => {
	const scale = calculateStudioScale({
		canvasSize,
		compositionHeight: destinationDimensions.height,
		compositionWidth: destinationDimensions.width,
		previewSize: previewSize.size,
	});
	const position = getCompositionPositionForDrop({
		compositionDimensions: preview.compositionDimensions,
		dropPosition: preview.dropPosition,
	});
	const contentLeft =
		canvasSize.width / 2 -
		(destinationDimensions.width * scale) / 2 -
		previewSize.translation.x;
	const contentTop =
		canvasSize.height / 2 -
		(destinationDimensions.height * scale) / 2 -
		previewSize.translation.y;

	return {
		left: contentLeft + (position?.x ?? 0) * scale,
		top: contentTop + (position?.y ?? 0) * scale,
		width: preview.compositionDimensions.width * scale,
		height: preview.compositionDimensions.height * scale,
	};
};
