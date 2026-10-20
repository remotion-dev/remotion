import {makeDragData} from './drag-data';
import type {StudioElementPayload} from './element-payload';

export const setStudioDragData = ({
	dataTransfer,
	payload,
}: {
	readonly dataTransfer: Pick<DataTransfer, 'effectAllowed' | 'setData'>;
	readonly payload: StudioElementPayload;
}): void => {
	const dragData = makeDragData({
		type: 'element',
		...payload.element,
		durationInFrames: payload.durationInFrames,
	});

	dataTransfer.effectAllowed = 'copy';
	dataTransfer.setData(dragData.mimeType, dragData.payload);
	dataTransfer.setData('text/plain', dragData.payload);
};
