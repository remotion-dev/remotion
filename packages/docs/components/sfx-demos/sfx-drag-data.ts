import {SFX_DRAG_MIME_TYPE, type SfxDragData} from '@remotion/drag-and-drop';

export const getSfxNameFromUrl = (src: string): string => {
	try {
		const url = new URL(src);
		return (
			url.pathname
				.split('/')
				.pop()
				?.replace(/\.[^.]+$/, '') || 'SFX'
		);
	} catch {
		return 'SFX';
	}
};

export const setSfxDragData = ({
	dataTransfer,
	dragData,
}: {
	readonly dataTransfer: DataTransfer;
	readonly dragData: SfxDragData;
}) => {
	const serialized = JSON.stringify(dragData);
	dataTransfer.effectAllowed = 'copy';
	dataTransfer.setData(SFX_DRAG_MIME_TYPE, serialized);
	dataTransfer.setData('application/json', serialized);
	dataTransfer.setData('text/plain', serialized);
};
