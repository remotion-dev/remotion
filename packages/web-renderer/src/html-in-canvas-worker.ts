import {waitForPaint, type HTMLCanvasWithLayoutSubtree} from './html-in-canvas';
import {withResolvers, type WithResolvers} from './with-resolvers';

// The encoder and muxer stay on their existing path. Only snapshot drawing and
// VideoFrame construction run here, concurrently with preparing the next frame.
const WORKER_CODE = `
let canvas, context;
self.onmessage = ({data}) => {
	let frame;
	try {
		if (data.canvas) {
			canvas = data.canvas;
			context = canvas.getContext('2d');
			if (!context || typeof context.drawElementImage !== 'function') {
				throw new Error('HTML-in-canvas is not available in the worker');
			}
			self.postMessage({id: data.id});
			return;
		}
		if (canvas.width !== data.width) canvas.width = data.width;
		if (canvas.height !== data.height) canvas.height = data.height;
		context.reset();
		context.drawElementImage(data.image, 0, 0, data.width, data.height);
		frame = new VideoFrame(canvas, {timestamp: data.timestamp});
		self.postMessage({id: data.id, frame}, [frame]);
	} catch (error) {
		self.postMessage({id: data.id, error: error instanceof Error ? error.message : String(error)});
	} finally {
		data.image?.close();
		frame?.close();
	}
};
`;

export const createHtmlInCanvasWorker = ({
	layoutCanvas,
	signal,
}: {
	layoutCanvas: HTMLCanvasWithLayoutSubtree;
	signal: AbortSignal | null;
}) => {
	const url = URL.createObjectURL(
		new Blob([WORKER_CODE], {type: 'application/javascript'}),
	);
	let worker: Worker;
	try {
		worker = new Worker(url);
	} finally {
		URL.revokeObjectURL(url);
	}

	let nextId = 0;
	let failure: Error | null = null;
	const pending = new Map<number, WithResolvers<VideoFrame | null>>();
	const stop = (error: Error) => {
		if (failure) return;
		failure = error;
		worker.terminate();
		for (const request of pending.values()) request.reject(error);
		pending.clear();
	};

	worker.onmessage = ({
		data,
	}: MessageEvent<{id: number; frame?: VideoFrame; error?: string}>) => {
		const request = pending.get(data.id);
		if (!request) {
			data.frame?.close();
			return;
		}

		pending.delete(data.id);
		if (data.error) {
			request.reject(new Error(data.error));
			stop(new Error(data.error));
		} else {
			request.resolve(data.frame ?? null);
		}
	};

	worker.onerror = (event) => stop(new Error(event.message));
	worker.onmessageerror = () =>
		stop(new Error('Could not deserialize HTML-in-canvas worker message'));
	const abort = () => stop(new Error('renderMediaOnWeb() was cancelled'));
	signal?.addEventListener('abort', abort, {once: true});
	const ready = withResolvers<VideoFrame | null>();
	pending.set(nextId, ready);
	// Observe startup failures immediately; capture still propagates them to the caller.
	ready.promise.catch(() => {});
	try {
		const canvas = layoutCanvas.transferControlToOffscreen();
		worker.postMessage({id: nextId++, canvas}, [canvas]);
	} catch (error) {
		signal?.removeEventListener('abort', abort);
		stop(error instanceof Error ? error : new Error(String(error)));
		throw error;
	}

	if (signal?.aborted) abort();

	return {
		capture: async ({
			element,
			width,
			height,
			timestamp,
		}: {
			element: HTMLElement;
			width: number;
			height: number;
			timestamp: number;
		}): Promise<{frame: Promise<VideoFrame>}> => {
			await ready.promise;
			if (failure) throw failure;
			await waitForPaint(layoutCanvas, signal);
			if (failure) throw failure;
			const image = layoutCanvas.captureElementImage!(element);
			const request = withResolvers<VideoFrame | null>();
			const id = nextId++;
			pending.set(id, request);
			try {
				worker.postMessage({id, image, width, height, timestamp}, [image]);
			} catch (error) {
				pending.delete(id);
				image.close();
				throw error;
			}

			return {
				frame: request.promise.then((frame) => {
					if (!frame)
						throw new Error('HTML-in-canvas worker did not return a frame');
					return frame;
				}),
			};
		},
		[Symbol.dispose]: () => {
			signal?.removeEventListener('abort', abort);
			stop(new Error('HTML-in-canvas worker disposed'));
		},
	};
};
