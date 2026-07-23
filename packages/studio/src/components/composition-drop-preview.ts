import type {PreviewSize} from 'remotion';
import {calculateStudioScale} from '../helpers/studio-fit-padding';
import {
	getCompositionPositionForDrop,
	type InsertElementDropPosition,
} from './import-assets';

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
};

export type CompositionDropPreviewBox = {
	readonly left: number;
	readonly top: number;
	readonly width: number;
	readonly height: number;
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
		destinationDimensions,
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
