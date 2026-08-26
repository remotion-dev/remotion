import {getCanvasCaptureImport} from '../helpers/get-canvas-capture-import';
import type {SetSelectedModalContextType} from '../state/modals';

export const handleCanvasCaptureDrop = async ({
	files,
	setSelectedModal,
}: {
	readonly files: readonly File[];
	readonly setSelectedModal: SetSelectedModalContextType['setSelectedModal'];
}): Promise<boolean> => {
	if (files.length !== 1) {
		return false;
	}

	const canvasCapture = await getCanvasCaptureImport(files[0]);
	if (canvasCapture === null) {
		return false;
	}

	setSelectedModal({
		type: 'new-comp',
		canvasCapture,
		folderName: null,
		parentName: null,
		stack: null,
	});
	return true;
};
