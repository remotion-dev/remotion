import type {WrappedCanvas} from 'mediabunny';
import type {VideoSample, VideoSampleSink} from 'mediabunny';
import type {MaxCanvasSinkFrameSize} from './video/props';

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

const makeStableFramePool = (
	getMaxCanvasSinkFrameSize: (() => MaxCanvasSinkFrameSize | null) | null,
) => {
	const availableCanvases: OffscreenCanvas[] = [];

	const makeStableFrame = (frame: VideoSample): WrappedCanvas => {
		let sampleCanvas: OffscreenCanvas | null = null;
		let sampleReleased = false;
		let effectCanvas: OffscreenCanvas | null = null;
		let retainedSource: CanvasImageSource | null = null;
		const isSizeLimited = () => {
			const size = getMaxCanvasSinkFrameSize?.();
			return (
				(size?.width ?? Infinity) < frame.displayWidth ||
				(size?.height ?? Infinity) < frame.displayHeight
			);
		};

		const sampleFrame: StableWrappedCanvas = {
			timestamp: frame.timestamp,
			duration: frame.duration,
			// Rotation and onVideoFrame can still request an owned canvas. Ordinary
			// playback can draw the retained sample without allocating one.
			get canvas() {
				const size = getMaxCanvasSinkFrameSize?.();
				const scale = Math.min(
					1,
					(size?.width ?? Infinity) / frame.displayWidth,
					(size?.height ?? Infinity) / frame.displayHeight,
				);
				const width = Math.max(1, Math.round(frame.displayWidth * scale));
				const height = Math.max(1, Math.round(frame.displayHeight * scale));
				if (
					!sampleCanvas ||
					sampleCanvas.width !== width ||
					sampleCanvas.height !== height
				) {
					sampleCanvas ??=
						availableCanvases.pop() ?? new OffscreenCanvas(width, height);
					if (sampleCanvas.width !== width) sampleCanvas.width = width;
					if (sampleCanvas.height !== height) sampleCanvas.height = height;
					const sampleContext = sampleCanvas.getContext('2d');
					if (!sampleContext)
						throw new Error('Could not create canvas context');
					sampleContext.imageSmoothingQuality = 'high';
					sampleContext.clearRect(
						0,
						0,
						sampleCanvas.width,
						sampleCanvas.height,
					);
					// Match transform()'s multi-step filtering without discarding the
					// original sample. A smoothing-quality hint alone can alias.
					const levels =
						2 * width < frame.displayWidth && 2 * height < frame.displayHeight
							? Math.floor(
									Math.log2(
										Math.min(
											frame.displayWidth / width,
											frame.displayHeight / height,
										),
									),
								)
							: 0;
					if (levels === 0) {
						frame.draw(sampleContext, 0, 0, width, height);
					} else {
						const mipWidth = width * 2 ** levels;
						const mipHeight = height * 2 ** levels;
						const mipCanvas =
							availableCanvases.pop() ??
							new OffscreenCanvas(mipWidth, mipHeight);
						if (mipCanvas.width !== mipWidth) mipCanvas.width = mipWidth;
						if (mipCanvas.height !== mipHeight) mipCanvas.height = mipHeight;
						const mipContext = mipCanvas.getContext('2d');
						if (!mipContext) throw new Error('Could not create canvas context');
						try {
							mipContext.imageSmoothingQuality = 'high';
							mipContext.clearRect(0, 0, mipWidth, mipHeight);
							frame.draw(mipContext, 0, 0, mipWidth, mipHeight);
							mipContext.globalCompositeOperation = 'copy';
							for (let level = levels; level > 1; level--) {
								const levelWidth = width * 2 ** level;
								const levelHeight = height * 2 ** level;
								mipContext.drawImage(
									mipCanvas,
									0,
									0,
									levelWidth,
									levelHeight,
									0,
									0,
									levelWidth / 2,
									levelHeight / 2,
								);
							}

							sampleContext.drawImage(
								mipCanvas,
								0,
								0,
								width * 2,
								height * 2,
								0,
								0,
								width,
								height,
							);
						} finally {
							mipContext.globalCompositeOperation = 'source-over';
							availableCanvases.push(mipCanvas);
						}
					}
				}

				return sampleCanvas;
			},
			[effectSource]: ({width, height, allowDirectSource}) => {
				const cappedSource = isSizeLimited() ? sampleFrame.canvas : null;
				if (
					width !== (cappedSource?.width ?? frame.displayWidth) ||
					height !== (cappedSource?.height ?? frame.displayHeight)
				) {
					effectCanvas ??=
						availableCanvases.pop() ?? new OffscreenCanvas(width, height);
					if (effectCanvas.width !== width) effectCanvas.width = width;
					if (effectCanvas.height !== height) effectCanvas.height = height;
					const effectContext = effectCanvas.getContext('2d');
					if (!effectContext)
						throw new Error('Could not create canvas context');
					effectContext.clearRect(0, 0, width, height);
					if (cappedSource)
						effectContext.drawImage(cappedSource, 0, 0, width, height);
					else frame.draw(effectContext, 0, 0, width, height);
					return effectCanvas;
				}

				if (cappedSource) return cappedSource;

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
				if (isSizeLimited())
					sampleContext.drawImage(sampleFrame.canvas, 0, 0, width, height);
				else frame.draw(sampleContext, 0, 0, width, height);
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
	getMaxCanvasSinkFrameSize:
		| (() => MaxCanvasSinkFrameSize | null)
		| null = null,
) => {
	const iterator = videoSink.samples(startTimestamp);

	const buffer: Slot[] = [];
	let chaining = false;
	let reachedEnd = false;
	let closed = false;
	let inFlight: Promise<void> | null = null;
	const stableFramePool = makeStableFramePool(getMaxCanvasSinkFrameSize);
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
		const promise = iterator.next();
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
