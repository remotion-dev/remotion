import {useCallback, useContext, useEffect, type FC} from 'react';
import {SetSelectedModalContext} from '../state/modals';
import {handleCanvasCaptureDrop} from './canvas-capture-drop';
import {isFileDragEvent} from './drop-handler-data';

const canvasCaptureMessagePrefix = 'remotion-canvas-capture';

type IncomingCanvasCapture = {
	readonly captureId: string;
	readonly filename: string;
	readonly mimeType: string;
	readonly chunks: Array<ArrayBuffer | null>;
};

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

	useEffect(() => {
		if (readOnlyStudio) {
			return;
		}

		const handoffWindow =
			window.remotion_browserStudio && window.parent !== window
				? window.parent
				: window;
		const captureId = new URL(handoffWindow.location.href).searchParams.get(
			'canvas-capture',
		);
		if (!captureId) {
			return;
		}

		let incoming: IncomingCanvasCapture | null = null;
		const onMessage = async (event: MessageEvent) => {
			if (
				event.source !== handoffWindow ||
				event.origin !== handoffWindow.location.origin ||
				typeof event.data !== 'object' ||
				event.data === null ||
				event.data.captureId !== captureId
			) {
				return;
			}

			if (
				event.data.type === `${canvasCaptureMessagePrefix}-start` &&
				typeof event.data.filename === 'string' &&
				typeof event.data.mimeType === 'string' &&
				Number.isSafeInteger(event.data.chunks) &&
				event.data.chunks >= 0
			) {
				incoming = {
					captureId,
					filename: event.data.filename,
					mimeType: event.data.mimeType,
					chunks: Array.from({length: event.data.chunks}, () => null),
				};
				return;
			}

			if (
				event.data.type === `${canvasCaptureMessagePrefix}-chunk` &&
				incoming &&
				Number.isSafeInteger(event.data.index) &&
				event.data.index >= 0 &&
				event.data.index < incoming.chunks.length &&
				typeof event.data.data === 'string'
			) {
				const binary = atob(event.data.data);
				const buffer = new ArrayBuffer(binary.length);
				const bytes = new Uint8Array(buffer);
				for (let index = 0; index < binary.length; index++) {
					bytes[index] = binary.charCodeAt(index);
				}

				incoming.chunks[event.data.index] = buffer;
				return;
			}

			if (
				event.data.type === `${canvasCaptureMessagePrefix}-complete` &&
				incoming &&
				incoming.chunks.every((chunk) => chunk !== null)
			) {
				const file = new File(incoming.chunks, incoming.filename, {
					type: incoming.mimeType,
				});
				incoming = null;
				await handleCanvasCaptureDrop({files: [file], setSelectedModal});
			}
		};

		handoffWindow.addEventListener('message', onMessage);
		handoffWindow.postMessage(
			{type: `${canvasCaptureMessagePrefix}-ready`, captureId},
			handoffWindow.location.origin,
		);

		return () => handoffWindow.removeEventListener('message', onMessage);
	}, [readOnlyStudio, setSelectedModal]);

	return null;
};
