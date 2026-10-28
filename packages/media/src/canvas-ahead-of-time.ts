import type {CanvasSink, WrappedCanvas} from 'mediabunny';
import {VideoSample, VideoSampleSink} from 'mediabunny';

export type CanvasAheadOfTimeNext =
	| {type: 'ready'; frame: WrappedCanvas | null}
	| {type: 'pending'; wait: () => Promise<WrappedCanvas | null>};

const BUFFER_SIZE = 3;

const releaseCanvas = Symbol('releaseCanvas');
const drawSample = Symbol('drawSample');

type StableWrappedCanvas = WrappedCanvas & {
	[releaseCanvas]: () => void;
	[drawSample]:
		| ((
				context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
				width: number,
				height: number,
		  ) => void)
		| null;
};

export const releaseStableFrame = (frame: WrappedCanvas | null) => {
	(frame as Partial<StableWrappedCanvas> | null)?.[releaseCanvas]?.();
};

export const drawStableFrame = (
	context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
	frame: WrappedCanvas,
	width: number,
	height: number,
) => {
	const draw = (frame as Partial<StableWrappedCanvas>)[drawSample];
	if (draw) {
		draw(context, width, height);
	} else {
		context.drawImage(frame.canvas, 0, 0, width, height);
	}
};

const makeStableFramePool = () => {
	const availableCanvases: OffscreenCanvas[] = [];

	const makeStableFrame = (
		frame: WrappedCanvas | VideoSample,
	): WrappedCanvas => {
		if (frame instanceof VideoSample) {
			let sampleCanvas: OffscreenCanvas | null = null;
			let sampleReleased = false;
			const sampleFrame: StableWrappedCanvas = {
				timestamp: frame.timestamp,
				duration: frame.duration,
				// Effects and onVideoFrame still receive an owned canvas. Ordinary
				// playback can draw the retained sample without allocating one.
				get canvas() {
					if (!sampleCanvas) {
						sampleCanvas =
							availableCanvases.pop() ??
							new OffscreenCanvas(frame.displayWidth, frame.displayHeight);
						if (sampleCanvas.width !== frame.displayWidth)
							sampleCanvas.width = frame.displayWidth;
						if (sampleCanvas.height !== frame.displayHeight)
							sampleCanvas.height = frame.displayHeight;
						const sampleContext = sampleCanvas.getContext('2d');
						if (!sampleContext)
							throw new Error('Could not create canvas context');
						sampleContext.clearRect(
							0,
							0,
							sampleCanvas.width,
							sampleCanvas.height,
						);
						frame.draw(
							sampleContext,
							0,
							0,
							sampleCanvas.width,
							sampleCanvas.height,
						);
					}

					return sampleCanvas;
				},
				[drawSample]: (sampleContext, width, height) => {
					frame.draw(sampleContext, 0, 0, width, height);
				},
				[releaseCanvas]: () => {
					if (sampleReleased) return;
					sampleReleased = true;
					frame.close();
					if (sampleCanvas) availableCanvases.push(sampleCanvas);
				},
			};
			return sampleFrame;
		}

		const {canvas} = frame;
		const stableCanvas =
			availableCanvases.pop() ??
			new OffscreenCanvas(canvas.width, canvas.height);
		if (stableCanvas.width !== canvas.width) {
			stableCanvas.width = canvas.width;
		}

		if (stableCanvas.height !== canvas.height) {
			stableCanvas.height = canvas.height;
		}

		const context = stableCanvas.getContext('2d');
		if (!context) {
			throw new Error('Could not create canvas context');
		}

		context.clearRect(0, 0, stableCanvas.width, stableCanvas.height);

		// CanvasSink may reuse canvases in a ring buffer when poolSize is set.
		// Since callers retain WrappedCanvas objects as the current/peeked frame,
		// copy the pixels before another decoded frame can overwrite the source.
		context.drawImage(canvas, 0, 0);

		let released = false;

		const stableFrame: StableWrappedCanvas = {
			canvas: stableCanvas,
			[drawSample]: null,
			duration: frame.duration,
			timestamp: frame.timestamp,
			[releaseCanvas]: () => {
				if (released) {
					return;
				}

				released = true;
				availableCanvases.push(stableCanvas);
			},
		};

		return stableFrame;
	};

	return {makeStableFrame};
};

type Slot = {
	promise: Promise<IteratorResult<WrappedCanvas | VideoSample, void>>;
	resolved: IteratorResult<WrappedCanvas, void> | null;
};

export const canvasesAheadOfTime = (
	videoSink: CanvasSink | VideoSampleSink,
	startTimestamp?: number,
) => {
	const iterator =
		videoSink instanceof VideoSampleSink
			? videoSink.samples(startTimestamp)
			: videoSink.canvases(startTimestamp);

	const buffer: Slot[] = [];
	let chaining = false;
	let reachedEnd = false;
	let closed = false;
	let inFlight: Promise<void> | null = null;
	const stableFramePool = makeStableFramePool();

	const takeFrame = (frame: WrappedCanvas | VideoSample): WrappedCanvas => {
		return stableFramePool.makeStableFrame(frame);
	};

	const fillNext = () => {
		if (chaining || reachedEnd || closed) return;
		if (buffer.length >= BUFFER_SIZE) return;

		chaining = true;
		const slot: Slot = {promise: iterator.next(), resolved: null};
		buffer.push(slot);
		inFlight = slot.promise.then(
			(result) => {
				chaining = false;
				inFlight = null;
				if (result.done) {
					slot.resolved = result;
					reachedEnd = true;
					return;
				}

				if (closed) {
					if (result.value instanceof VideoSample) result.value.close();
					slot.resolved = {done: true, value: undefined};
					return;
				}

				slot.resolved = {...result, value: takeFrame(result.value)};
				fillNext();
			},
			() => {
				chaining = false;
				inFlight = null;
			},
		);
	};

	fillNext();

	const next = (): CanvasAheadOfTimeNext => {
		const slot = buffer.shift();
		fillNext();

		if (!slot) {
			if (reachedEnd || closed) {
				return {type: 'ready', frame: null};
			}

			const chain = inFlight;
			return {
				type: 'pending',
				wait: async () => {
					await chain;
					const next2 = buffer.shift();
					fillNext();
					if (!next2) return null;
					if (next2.resolved) {
						return next2.resolved.done ? null : next2.resolved.value;
					}

					const result = await next2.promise;
					return result.done ? null : takeFrame(result.value);
				},
			};
		}

		if (slot.resolved) {
			if (slot.resolved.done) {
				return {type: 'ready', frame: null};
			}

			return {type: 'ready', frame: slot.resolved.value};
		}

		return {
			type: 'pending',
			wait: async () => {
				const result = await slot.promise;
				if (slot.resolved) {
					return slot.resolved.done ? null : slot.resolved.value;
				}

				return result.done ? null : takeFrame(result.value);
			},
		};
	};

	const closeIterator = async () => {
		closed = true;
		for (const slot of buffer) {
			if (slot.resolved && !slot.resolved.done) {
				releaseStableFrame(slot.resolved.value);
			}
		}

		buffer.length = 0;
		await iterator.return();
	};

	return {next, closeIterator};
};

export type CanvasAheadOfTimeIterator = ReturnType<typeof canvasesAheadOfTime>;
