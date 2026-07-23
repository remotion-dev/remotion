import type {ConstructedDragData, SfxDragData} from '@remotion/drag-and-drop';

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
	readonly dragData: ConstructedDragData<SfxDragData>;
}) => {
	dataTransfer.effectAllowed = 'copy';
	dataTransfer.setData(dragData.mimeType, dragData.payload);
};
