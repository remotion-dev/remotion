import type {VideoSampleTransformOptions, WrappedCanvas} from 'mediabunny';
import type {VideoSample, VideoSampleSink} from 'mediabunny';

export type CanvasAheadOfTimeNext =
	| {type: 'ready'; frame: WrappedCanvas | null}
	| {type: 'pending'; wait: () => Promise<WrappedCanvas | null>};

const BUFFER_SIZE = 3;

const releaseCanvas = Symbol('releaseCanvas');
const drawSample = Symbol('drawSample');
const effectSource = Symbol('effectSource');

type EffectSourceOptions = {
	width: number;
	height: number;
	allowDirectSource: boolean;
};

type StableWrappedCanvas = WrappedCanvas & {
	[releaseCanvas]: () => void;
	[effectSource]: ((options: EffectSourceOptions) => CanvasImageSource) | null;
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

// Effects may await GPU initialization, so this source must outlive a microtask.
export const getStableEffectSource = (
	frame: WrappedCanvas,
	options: EffectSourceOptions,
): CanvasImageSource => {
	return (
		(frame as Partial<StableWrappedCanvas>)[effectSource]?.(options) ??
		frame.canvas
	);
};

const makeStableFramePool = () => {
	const availableCanvases: OffscreenCanvas[] = [];

	const makeStableFrame = (frame: VideoSample): WrappedCanvas => {
		let sampleCanvas: OffscreenCanvas | null = null;
		let sampleReleased = false;
		let effectCanvas: OffscreenCanvas | null = null;
		let retainedSource: CanvasImageSource | null = null;
		const sampleFrame: StableWrappedCanvas = {
			timestamp: frame.timestamp,
			duration: frame.duration,
			// Rotation and onVideoFrame can still request an owned canvas. Ordinary
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
			[effectSource]: ({width, height, allowDirectSource}) => {
				if (width !== frame.displayWidth || height !== frame.displayHeight) {
					effectCanvas ??=
						availableCanvases.pop() ?? new OffscreenCanvas(width, height);
					if (effectCanvas.width !== width) effectCanvas.width = width;
					if (effectCanvas.height !== height) effectCanvas.height = height;
					const effectContext = effectCanvas.getContext('2d');
					if (!effectContext)
						throw new Error('Could not create canvas context');
					effectContext.clearRect(0, 0, width, height);
					frame.draw(effectContext, 0, 0, width, height);
					return effectCanvas;
				}

				// GPU uploads do not always match Canvas2D's color/orientation conversion.
				if (
					!allowDirectSource ||
					sampleCanvas ||
					frame.rotation !== 0 ||
					frame.flip
				)
					return sampleFrame.canvas;
				if (!retainedSource) {
					const source = frame.toCanvasImageSource();
					retainedSource =
						typeof VideoFrame !== 'undefined' && source instanceof VideoFrame
							? source.clone()
							: source;
				}

				return retainedSource;
			},
			[drawSample]: (sampleContext, width, height) => {
				frame.draw(sampleContext, 0, 0, width, height);
			},
			[releaseCanvas]: () => {
				if (sampleReleased) return;
				sampleReleased = true;
				if (
					typeof VideoFrame !== 'undefined' &&
					retainedSource instanceof VideoFrame
				)
					retainedSource.close();
				frame.close();
				if (sampleCanvas) availableCanvases.push(sampleCanvas);
				if (effectCanvas) availableCanvases.push(effectCanvas);
			},
		};
		return sampleFrame;
	};

	return {makeStableFrame};
};

type Slot = {
	promise: Promise<IteratorResult<VideoSample, void>>;
	resolved: IteratorResult<WrappedCanvas, void> | null;
};

export const canvasesAheadOfTime = (
	videoSink: VideoSampleSink,
	startTimestamp?: number,
	resize: VideoSampleTransformOptions | null = null,
) => {
	const iterator = videoSink.samples(startTimestamp);

	const buffer: Slot[] = [];
	let chaining = false;
	let reachedEnd = false;
	let closed = false;
	let inFlight: Promise<void> | null = null;
	const stableFramePool = makeStableFramePool();
	const unclaimedFrames = new Set<WrappedCanvas>();

	const takeFrame = (frame: VideoSample): WrappedCanvas => {
		const stable = stableFramePool.makeStableFrame(frame);
		unclaimedFrames.add(stable);
		return stable;
	};

	const claimFrame = (frame: WrappedCanvas): WrappedCanvas | null => {
		unclaimedFrames.delete(frame);
		if (closed) {
			releaseStableFrame(frame);
			return null;
		}

		return frame;
	};

	const waitForSlot = async (slot: Slot) => {
		await slot.promise;
		// The resolution handler is registered before any consumer can await this slot.
		const resolved = slot.resolved!;
		return resolved.done ? null : claimFrame(resolved.value);
	};

	const fillNext = () => {
		if (chaining || reachedEnd || closed) return;
		if (buffer.length >= BUFFER_SIZE) return;

		chaining = true;
		const nextSample = iterator.next();
		const promise = resize
			? nextSample.then(async (result) => {
					if (result.done || closed) return result;
					try {
						// transform() uses Mediabunny's pooled, quality-preserving resampling.
						// The returned sample owns its pixels independently of that scratch canvas.
						return {
							done: false as const,
							value: await result.value.transform(resize),
						};
					} finally {
						result.value.close();
					}
				})
			: nextSample;
		const slot: Slot = {promise, resolved: null};
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
					result.value.close();

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
						return next2.resolved.done
							? null
							: claimFrame(next2.resolved.value);
					}

					return waitForSlot(next2);
				},
			};
		}

		if (slot.resolved) {
			if (slot.resolved.done) {
				return {type: 'ready', frame: null};
			}

			return {type: 'ready', frame: claimFrame(slot.resolved.value)};
		}

		return {type: 'pending', wait: () => waitForSlot(slot)};
	};

	const closeIterator = async () => {
		closed = true;
		// A caller may abandon a pending next() after its slot leaves the buffer.
		// Keep ownership until wait() actually hands the frame to that caller.
		unclaimedFrames.forEach(releaseStableFrame);
		unclaimedFrames.clear();

		buffer.length = 0;
		await iterator.return();
	};

	return {next, closeIterator};
};

export type CanvasAheadOfTimeIterator = ReturnType<typeof canvasesAheadOfTime>;
