import {RenderInternals} from '@remotion/renderer';

export const copyStillToClipBoard = (img: string): Promise<void> => {
	return RenderInternals.copyImageToClipboard(img, 'info');
};
