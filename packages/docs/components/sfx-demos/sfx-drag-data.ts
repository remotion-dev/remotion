import {SFX_DRAG_MIME_TYPE, type SfxDragData} from '@remotion/studio-shared';

export const makeSfxDragData = ({
	name,
	url,
}: {
	readonly name: string;
	readonly url: string;
}): SfxDragData => {
	return {
		type: 'remotion-sfx',
		version: 1,
		sfx: {
			name,
			url,
		},
	};
};

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
