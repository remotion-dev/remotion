import {
	makeShapeDragData,
	SHAPE_DRAG_MIME_TYPE,
	type ShapeDragData,
	type ShapeName,
} from '@remotion/studio-shared';

export {makeShapeDragData, type ShapeName};

export const setShapeDragData = ({
	dataTransfer,
	dragData,
}: {
	readonly dataTransfer: DataTransfer;
	readonly dragData: ShapeDragData;
}) => {
	const serialized = JSON.stringify(dragData);
	dataTransfer.effectAllowed = 'copy';
	dataTransfer.setData(SHAPE_DRAG_MIME_TYPE, serialized);
	dataTransfer.setData('application/json', serialized);
	dataTransfer.setData('text/plain', serialized);
};
