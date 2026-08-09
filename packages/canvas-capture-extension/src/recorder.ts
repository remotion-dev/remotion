import type {Quality} from 'mediabunny';
import type {CaptureFormat} from './messages';

type VideoFrameSource = {
	add: (frame: VideoFrame) => Promise<void>;
	close: () => void;
};

type RecordingOutput = {
	start: () => Promise<void>;
	finalize: () => Promise<void>;
	cancel: () => Promise<void>;
};

type RecordingTarget = {
	readonly buffer: ArrayBuffer | null;
};

type MouseMovement = {
	readonly timeInSeconds: number;
	readonly clientX: number;
	readonly clientY: number;
	readonly pageX: number;
	readonly pageY: number;
	readonly canvasX: number | null;
	readonly canvasY: number | null;
	readonly cursor: string;
};

type PointerClick = {
	readonly timeInSeconds: number;
	readonly type: 'pointer-down' | 'pointer-up';
};

type CaptureMetadata = {
	readonly density: number;
	readonly contentRect: {
		readonly left: number;
		readonly top: number;
		readonly width: number;
		readonly height: number;
	};
	readonly canvasSize: {
		readonly width: number;
		readonly height: number;
	};
	readonly viewport: {
		readonly width: number;
		readonly height: number;
		readonly scrollX: number;
		readonly scrollY: number;
	};
};

type RecordingState = {
	readonly output: RecordingOutput;
	readonly target: RecordingTarget;
	readonly source: VideoFrameSource;
	readonly startedAt: number;
	readonly mouseMovements: MouseMovement[];
	readonly pointerClicks: PointerClick[];
	lastTimestampInSeconds: number | null;
	lastFramePromise: Promise<void>;
	pendingFrame: VideoFrame | null;
	isEncodingFrame: boolean;
	hasEncodingError: boolean;
	encodingError: unknown;
	frameCount: number;
	captureMetadata: CaptureMetadata | null;
	isFinalizing: boolean;
};

export type HtmlInCanvasElementImage = {
	readonly width: number;
	readonly height: number;
	close: () => void;
};

type DrawElementImageSource = Element | HtmlInCanvasElementImage;

type DrawElementImage = {
	(
		element: DrawElementImageSource,
		dx: number,
		dy: number,
		dWidth?: number,
		dHeight?: number,
	): DOMMatrix;
	(
		element: DrawElementImageSource,
		sx: number,
		sy: number,
		sWidth: number,
		sHeight: number,
		dx: number,
		dy: number,
		dWidth?: number,
		dHeight?: number,
	): DOMMatrix;
};

export type HtmlInCanvasElement = HTMLCanvasElement & {
	layoutSubtree?: boolean;
	requestPaint?: () => void;
	captureElementImage?: (element: Element) => HtmlInCanvasElementImage;
};

export type HtmlInCanvasRenderingContext2D = CanvasRenderingContext2D & {
	drawElementImage?: DrawElementImage;
	reset?: () => void;
};

export type HtmlInCanvasOffscreenRenderingContext2D =
	OffscreenCanvasRenderingContext2D & {
		drawElementImage?: DrawElementImage;
		reset?: () => void;
	};

type CanvasCaptureRecorderOptions = {
	readonly format: CaptureFormat;
	readonly getContentRect: () => DOMRect;
	readonly getDensity: () => number;
	readonly getFilename: () => string;
};

const fallbackFrameDurationInSeconds = 1 / 60;

const CAPTURE_METADATA_TAG_KEY = 'REMOTION_CAPTURE_DATA';

export const isHtmlInCanvasAvailable = () => {
	if (typeof document === 'undefined') {
		return false;
	}

	const canvas = document.createElement('canvas') as HtmlInCanvasElement;
	const context = canvas.getContext(
		'2d',
	) as HtmlInCanvasRenderingContext2D | null;
	const captureContext =
		typeof OffscreenCanvas === 'undefined'
			? null
			: (new OffscreenCanvas(2, 2).getContext(
					'2d',
				) as HtmlInCanvasOffscreenRenderingContext2D | null);

	return (
		typeof canvas.requestPaint === 'function' &&
		typeof canvas.captureElementImage === 'function' &&
		typeof context?.drawElementImage === 'function' &&
		typeof captureContext?.drawElementImage === 'function' &&
		typeof VideoFrame !== 'undefined'
	);
};

export const resetCanvas = (
	context:
		| HtmlInCanvasRenderingContext2D
		| HtmlInCanvasOffscreenRenderingContext2D,
	canvas: HTMLCanvasElement | OffscreenCanvas,
) => {
	if (typeof context.reset === 'function') {
		context.reset();
		return;
	}

	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, canvas.width, canvas.height);
};

const roundDownToEven = (value: number) =>
	Math.max(2, Math.floor(value / 2) * 2);

export const getScaledCanvasSize = (
	width: number,
	height: number,
	density: number,
) => ({
	width: roundDownToEven(width * density),
	height: roundDownToEven(height * density),
});

const getVideoEncodingOptions = (bitrate: Quality) => ({
	bitrate,
	latencyMode: 'realtime' as const,
});

export const canEncodeCapture = async (
	format: CaptureFormat,
	{width, height}: {readonly width: number; readonly height: number},
) => {
	const {canEncodeVideo, QUALITY_HIGH} = await import('mediabunny');
	return canEncodeVideo(format === 'mp4' ? 'avc' : 'vp9', {
		width,
		height,
		...getVideoEncodingOptions(QUALITY_HIGH),
	});
};

export const assertCanEncodeCapture = async (
	format: CaptureFormat,
	size: {readonly width: number; readonly height: number},
) => {
	if (await canEncodeCapture(format, size)) {
		return;
	}

	const label = format === 'mp4' ? 'H.264 MP4' : 'VP9 WebM';
	throw new Error(
		`${label} encoding is not supported at ${size.width}×${size.height} in this browser. Reduce the scale or select a smaller area.`,
	);
};

const setCanvasSize = (
	canvas: HTMLCanvasElement | OffscreenCanvas,
	scaledWidth: number,
	scaledHeight: number,
) => {
	if (canvas.width !== scaledWidth) {
		canvas.width = scaledWidth;
	}

	if (canvas.height !== scaledHeight) {
		canvas.height = scaledHeight;
	}
};

export const syncCanvasSize = (
	canvas: HTMLCanvasElement | OffscreenCanvas,
	width: number,
	height: number,
	density: number,
) => {
	const size = getScaledCanvasSize(width, height, density);
	setCanvasSize(canvas, size.width, size.height);
};

export const syncDisplayCanvasSize = (
	canvas: HTMLCanvasElement,
	width: number,
	height: number,
	density: number,
) => {
	setCanvasSize(
		canvas,
		Math.max(1, Math.round(width * density)),
		Math.max(1, Math.round(height * density)),
	);
};

const getCursorForElement = (element: Element | null): string => {
	let current: Element | null = element;

	while (current) {
		const {cursor} = window.getComputedStyle(current);
		if (cursor !== 'auto') {
			return cursor;
		}

		current = current.parentElement;
	}

	return 'auto';
};

const addFrame = (recording: RecordingState, canvas: OffscreenCanvas) => {
	const elapsedInSeconds = Math.max(
		0,
		(performance.now() - recording.startedAt) / 1000,
	);
	const timestampInSeconds =
		recording.lastTimestampInSeconds === null ? 0 : elapsedInSeconds;
	const durationInSeconds =
		recording.lastTimestampInSeconds === null
			? fallbackFrameDurationInSeconds
			: Math.max(
					fallbackFrameDurationInSeconds,
					elapsedInSeconds - recording.lastTimestampInSeconds,
				);
	recording.lastTimestampInSeconds = timestampInSeconds;
	const frame = new VideoFrame(canvas, {
		timestamp: Math.round(timestampInSeconds * 1_000_000),
		duration: Math.round(durationInSeconds * 1_000_000),
	});

	if (recording.hasEncodingError) {
		frame.close();
		return;
	}

	recording.pendingFrame?.close();
	recording.pendingFrame = frame;
	if (recording.isEncodingFrame) {
		return;
	}

	recording.isEncodingFrame = true;
	recording.lastFramePromise = (async () => {
		try {
			while (recording.pendingFrame) {
				const frameToEncode = recording.pendingFrame;
				recording.pendingFrame = null;
				await recording.source.add(frameToEncode);
				recording.frameCount++;
			}
		} catch (error) {
			recording.hasEncodingError = true;
			recording.encodingError = error;
			recording.pendingFrame?.close();
			recording.pendingFrame = null;
			throw error;
		} finally {
			recording.isEncodingFrame = false;
		}
	})();
	recording.lastFramePromise.catch(() => undefined);
};

const finalizeRecording = async (
	recording: RecordingState,
	filename: string,
	format: CaptureFormat,
): Promise<File> => {
	await recording.lastFramePromise;
	if (recording.hasEncodingError) {
		throw recording.encodingError;
	}

	if (recording.frameCount === 0) {
		throw new Error('No frames were added to the canvas recording.');
	}

	recording.source.close();
	await recording.output.finalize();

	if (!recording.target.buffer) {
		throw new Error('Mediabunny did not return an output buffer.');
	}

	const captureData = JSON.stringify({
		startedAt: recording.startedAt,
		endedAt: performance.now(),
		captureMetadata: recording.captureMetadata,
		mouseMovements: recording.mouseMovements,
		pointerClicks: recording.pointerClicks,
	});

	const {
		ALL_FORMATS,
		BufferSource,
		BufferTarget,
		Conversion,
		Input,
		Mp4OutputFormat,
		Output,
		WebMOutputFormat,
	} = await import('mediabunny');
	const remuxInput = new Input({
		formats: ALL_FORMATS,
		source: new BufferSource(recording.target.buffer),
	});
	const remuxTarget = new BufferTarget();
	const remuxOutput = new Output({
		format:
			format === 'mp4'
				? new Mp4OutputFormat({metadataFormat: 'mdta'})
				: new WebMOutputFormat(),
		target: remuxTarget,
	});
	const conversion = await Conversion.init({
		input: remuxInput,
		output: remuxOutput,
		tags: {
			raw: {[CAPTURE_METADATA_TAG_KEY]: captureData},
		},
		showWarnings: false,
	});
	await conversion.execute();

	if (!remuxTarget.buffer) {
		throw new Error('Mediabunny remux did not return an output buffer.');
	}

	return new File([remuxTarget.buffer], filename, {
		type: format === 'mp4' ? 'video/mp4' : 'video/webm',
	});
};

export class CanvasCaptureRecorder {
	readonly #options: CanvasCaptureRecorderOptions;
	#recording: RecordingState | null = null;
	#recordingAction: Promise<void> = Promise.resolve();
	#disposed = false;

	constructor(options: CanvasCaptureRecorderOptions) {
		this.#options = options;
		window.addEventListener('pointermove', this.#onPointerMove);
		window.addEventListener('pointerdown', this.#onPointerDown, true);
		window.addEventListener('pointerup', this.#onPointerUp, true);
	}

	isRecording = () => this.#recording !== null;

	startRecording = async () => {
		if (this.#disposed) {
			throw new Error('This canvas recorder has already been disposed.');
		}

		if (this.#recording) {
			return;
		}

		const density = this.#options.getDensity();
		if (!Number.isFinite(density) || density <= 0) {
			throw new Error('Canvas capture scale must be greater than 0.');
		}

		const {
			BufferTarget,
			Mp4OutputFormat,
			Output,
			QUALITY_HIGH,
			VideoSample,
			VideoSampleSource,
			WebMOutputFormat,
		} = await import('mediabunny');
		const target = new BufferTarget();
		const output = new Output({
			format:
				this.#options.format === 'mp4'
					? new Mp4OutputFormat()
					: new WebMOutputFormat(),
			target,
		});
		const videoSampleSource = new VideoSampleSource({
			codec: this.#options.format === 'mp4' ? 'avc' : 'vp9',
			...getVideoEncodingOptions(QUALITY_HIGH),
		});
		const source: VideoFrameSource = {
			add: async (frame) => {
				const sample = new VideoSample(frame);
				try {
					await videoSampleSource.add(sample);
				} finally {
					sample.close();
					frame.close();
				}
			},
			close: () => videoSampleSource.close(),
		};

		output.addVideoTrack(videoSampleSource);
		await output.start();

		this.#recording = {
			output,
			target,
			source,
			startedAt: performance.now(),
			mouseMovements: [],
			pointerClicks: [],
			lastTimestampInSeconds: null,
			lastFramePromise: Promise.resolve(),
			pendingFrame: null,
			isEncodingFrame: false,
			hasEncodingError: false,
			encodingError: undefined,
			frameCount: 0,
			captureMetadata: null,
			isFinalizing: false,
		};
	};

	stopRecording = async (): Promise<File | null> => {
		const recording = this.#recording;
		if (!recording || recording.isFinalizing) {
			return null;
		}

		recording.isFinalizing = true;
		try {
			return await finalizeRecording(
				recording,
				this.#options.getFilename(),
				this.#options.format,
			);
		} catch (err) {
			await recording.output.cancel().catch(() => undefined);
			throw err;
		} finally {
			this.#recording = null;
		}
	};

	toggleRecording = async () => {
		this.#recordingAction = this.#recordingAction.then(async () => {
			if (this.#recording) {
				await this.stopRecording();
				return;
			}

			await this.startRecording();
		});

		await this.#recordingAction;
	};

	addFrame = (canvas: OffscreenCanvas) => {
		const recording = this.#recording;
		if (!recording || recording.isFinalizing) {
			return;
		}

		const rect = this.#options.getContentRect();
		const density = this.#options.getDensity();
		recording.captureMetadata = {
			density,
			contentRect: {
				left: rect.left,
				top: rect.top,
				width: rect.width,
				height: rect.height,
			},
			canvasSize: {
				width: canvas.width,
				height: canvas.height,
			},
			viewport: {
				width: window.innerWidth,
				height: window.innerHeight,
				scrollX: window.scrollX,
				scrollY: window.scrollY,
			},
		};
		addFrame(recording, canvas);
	};

	dispose = () => {
		if (this.#disposed) {
			return;
		}

		this.#disposed = true;
		window.removeEventListener('pointermove', this.#onPointerMove);
		window.removeEventListener('pointerdown', this.#onPointerDown, true);
		window.removeEventListener('pointerup', this.#onPointerUp, true);

		const recording = this.#recording;
		if (!recording || recording.isFinalizing) {
			return;
		}

		recording.isFinalizing = true;
		recording.pendingFrame?.close();
		recording.pendingFrame = null;
		recording.output.cancel().catch(() => undefined);
		this.#recording = null;
	};

	#onPointerMove = (event: PointerEvent) => {
		const recording = this.#recording;
		if (!recording || recording.isFinalizing) {
			return;
		}

		const rect = this.#options.getContentRect();
		const density = this.#options.getDensity();
		recording.mouseMovements.push({
			timeInSeconds: (performance.now() - recording.startedAt) / 1000,
			clientX: event.clientX,
			clientY: event.clientY,
			pageX: event.pageX,
			pageY: event.pageY,
			canvasX: (event.clientX - rect.left) * density,
			canvasY: (event.clientY - rect.top) * density,
			cursor: getCursorForElement(
				document.elementFromPoint(event.clientX, event.clientY),
			),
		});
	};

	#onPointerDown = () => {
		const recording = this.#recording;
		if (!recording || recording.isFinalizing) {
			return;
		}

		recording.pointerClicks.push({
			timeInSeconds: (performance.now() - recording.startedAt) / 1000,
			type: 'pointer-down',
		});
	};

	#onPointerUp = () => {
		const recording = this.#recording;
		if (!recording || recording.isFinalizing) {
			return;
		}

		recording.pointerClicks.push({
			timeInSeconds: (performance.now() - recording.startedAt) / 1000,
			type: 'pointer-up',
		});
	};
}
