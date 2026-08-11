import {useEffect} from 'react';
import type {Source} from './convert-state';

const MESSAGE_PREFIX = 'remotion-canvas-capture';

type IncomingCapture = {
	readonly captureId: string;
	readonly filename: string;
	readonly mimeType: string;
	readonly chunks: Array<ArrayBuffer | null>;
};

const decodeBase64 = (value: string) => {
	const binary = atob(value);
	const buffer = new ArrayBuffer(binary.length);
	const bytes = new Uint8Array(buffer);
	for (let index = 0; index < binary.length; index++) {
		bytes[index] = binary.charCodeAt(index);
	}

	return buffer;
};

export const useCanvasCapture = (
	setSrc: React.Dispatch<React.SetStateAction<Source | null>>,
) => {
	useEffect(() => {
		const captureId = new URL(window.location.href).searchParams.get(
			'canvas-capture',
		);
		if (!captureId) {
			return;
		}

		let incoming: IncomingCapture | null = null;

		const onMessage = (event: MessageEvent) => {
			if (
				event.source !== window ||
				event.origin !== window.location.origin ||
				typeof event.data !== 'object' ||
				event.data === null ||
				event.data.captureId !== captureId
			) {
				return;
			}

			if (
				event.data.type === `${MESSAGE_PREFIX}-start` &&
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
				event.data.type === `${MESSAGE_PREFIX}-chunk` &&
				incoming &&
				Number.isSafeInteger(event.data.index) &&
				event.data.index >= 0 &&
				event.data.index < incoming.chunks.length &&
				typeof event.data.data === 'string'
			) {
				incoming.chunks[event.data.index] = decodeBase64(event.data.data);
				return;
			}

			if (
				event.data.type === `${MESSAGE_PREFIX}-complete` &&
				incoming &&
				incoming.chunks.every((chunk) => chunk !== null)
			) {
				const file = new File(incoming.chunks, incoming.filename, {
					type: incoming.mimeType,
				});
				setSrc({type: 'file', file});
				incoming = null;
			}
		};

		window.addEventListener('message', onMessage);
		window.postMessage(
			{type: `${MESSAGE_PREFIX}-ready`, captureId},
			window.location.origin,
		);

		return () => window.removeEventListener('message', onMessage);
	}, [setSrc]);
};
