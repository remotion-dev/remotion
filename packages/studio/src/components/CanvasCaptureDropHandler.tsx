import {useCallback, useContext, useEffect, type FC} from 'react';
import {SetSelectedModalContext} from '../state/modals';
import {handleCanvasCaptureDrop} from './canvas-capture-drop';
import {isFileDragEvent} from './drop-handler-data';

export const CanvasCaptureDropHandler: FC<{
	readonly readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);

	const onDragOver = useCallback(
		(event: DragEvent) => {
			if (readOnlyStudio || !isFileDragEvent(event)) {
				return;
			}

			event.preventDefault();
			if (event.dataTransfer) {
				event.dataTransfer.dropEffect = 'copy';
			}
		},
		[readOnlyStudio],
	);

	const onDrop = useCallback(
		async (event: DragEvent) => {
			if (readOnlyStudio || !isFileDragEvent(event)) {
				return;
			}

			const files = Array.from(event.dataTransfer?.files ?? []);
			if (files.length === 0) {
				return;
			}

			event.preventDefault();
			await handleCanvasCaptureDrop({files, setSelectedModal});
		},
		[readOnlyStudio, setSelectedModal],
	);

	useEffect(() => {
		document.addEventListener('dragover', onDragOver);
		document.addEventListener('drop', onDrop);

		return () => {
			document.removeEventListener('dragover', onDragOver);
			document.removeEventListener('drop', onDrop);
		};
	}, [onDragOver, onDrop]);

	return null;
};
