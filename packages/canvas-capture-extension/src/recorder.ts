import type {CropRectangle} from 'mediabunny';

type CanvasVideoSource = {
	add: (
		timestamp: number,
		duration: number,
		encodeOptions?: VideoEncoderEncodeOptions,
	) => Promise<void>;
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
	readonly source: CanvasVideoSource;
	readonly startedAt: number;
	readonly mouseMovements: MouseMovement[];
	readonly pointerClicks: PointerClick[];
	lastTimestampInSeconds: number | null;
	lastFramePromise: Promise<void>;
	frameCount: number;
	captureMetadata: CaptureMetadata | null;
	isFinalizing: boolean;
};

export type HtmlInCanvasElement = HTMLCanvasElement & {
	layoutSubtree?: boolean;
	requestPaint?: () => void;
};

export type HtmlInCanvasRenderingContext2D = CanvasRenderingContext2D & {
	drawElementImage?: (
		element: Element,
		dx: number,
		dy: number,
		dWidth?: number,
		dHeight?: number,
	) => DOMMatrix;
	reset?: () => void;
};

type CanvasCaptureRecorderOptions = {
	readonly canvas: HTMLCanvasElement;
	readonly crop?: CropRectangle;
	readonly getContentRect: () => DOMRect;
	readonly getDensity: () => number;
	readonly getFilename: () => string;
};

const fallbackFrameDurationInSeconds = 1 / 60;
const recordingVideoBitrate = 120_000_000;
const recordingKeyFrameIntervalInSeconds = 0.5;

const CAPTURE_METADATA_TAG_KEY = 'REMOTION_CAPTURE_DATA';

export const isHtmlInCanvasAvailable = () => {
	if (typeof document === 'undefined') {
		return false;
	}

	const canvas = document.createElement('canvas') as HtmlInCanvasElement;
	const context = canvas.getContext(
		'2d',
	) as HtmlInCanvasRenderingContext2D | null;

	return (
		typeof canvas.requestPaint === 'function' &&
		typeof context?.drawElementImage === 'function'
	);
};

export const resetCanvas = (
	context: HtmlInCanvasRenderingContext2D,
	canvas: HTMLCanvasElement,
) => {
	if (typeof context.reset === 'function') {
		context.reset();
		return;
	}

	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, canvas.width, canvas.height);
};

const roundUpToEven = (value: number) => {
	const rounded = Math.max(2, Math.ceil(value));
	return rounded % 2 === 0 ? rounded : rounded + 1;
};

export const syncCanvasSize = (
	canvas: HTMLCanvasElement,
	width: number,
	height: number,
	density: number,
) => {
	const scaledWidth = roundUpToEven(width * density);
	const scaledHeight = roundUpToEven(height * density);

	if (canvas.width !== scaledWidth) {
		canvas.width = scaledWidth;
	}

	if (canvas.height !== scaledHeight) {
		canvas.height = scaledHeight;
	}
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

const addFrame = (recording: RecordingState) => {
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
	const keyFrame = recording.lastTimestampInSeconds === null;

	recording.lastTimestampInSeconds = timestampInSeconds;
	recording.lastFramePromise = recording.lastFramePromise.then(async () => {
		await recording.source.add(timestampInSeconds, durationInSeconds, {
			keyFrame,
		});
		recording.frameCount++;
	});
	recording.lastFramePromise.catch(() => undefined);
};

const finalizeRecording = async (
	recording: RecordingState,
	filename: string,
): Promise<File> => {
	addFrame(recording);
	await recording.lastFramePromise;

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
		Output,
		WebMOutputFormat,
	} = await import('mediabunny');
	const remuxInput = new Input({
		formats: ALL_FORMATS,
		source: new BufferSource(recording.target.buffer),
	});
	const remuxTarget = new BufferTarget();
	const remuxOutput = new Output({
		format: new WebMOutputFormat(),
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

	return new File([remuxTarget.buffer], filename, {type: 'video/webm'});
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

		const {BufferTarget, CanvasSource, Output, WebMOutputFormat} =
			await import('mediabunny');
		const target = new BufferTarget();
		const output = new Output({
			format: new WebMOutputFormat(),
			target,
		});
		const source = new CanvasSource(this.#options.canvas, {
			codec: 'vp9',
			bitrate: recordingVideoBitrate,
			latencyMode: 'realtime',
			keyFrameInterval: recordingKeyFrameIntervalInSeconds,
			transform: this.#options.crop ? {crop: this.#options.crop} : undefined,
		});

		output.addVideoTrack(source);
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
			return await finalizeRecording(recording, this.#options.getFilename());
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

	addFrame = () => {
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
				width: this.#options.crop?.width ?? this.#options.canvas.width,
				height: this.#options.crop?.height ?? this.#options.canvas.height,
			},
			viewport: {
				width: window.innerWidth,
				height: window.innerHeight,
				scrollX: window.scrollX,
				scrollY: window.scrollY,
			},
		};
		addFrame(recording);
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
