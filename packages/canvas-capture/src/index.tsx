import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from 'react';

type HtmlInCanvasElement = HTMLCanvasElement & {
	layoutSubtree?: boolean;
	requestPaint?: () => void;
};

type HtmlInCanvasRenderingContext2D = CanvasRenderingContext2D & {
	drawElementImage?: (
		element: Element,
		dx: number,
		dy: number,
		dWidth?: number,
		dHeight?: number,
	) => DOMMatrix;
	reset?: () => void;
};

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

export type HtmlInCanvasCaptureHandle = {
	readonly toggleRecording: () => Promise<void>;
	readonly startRecording: () => Promise<void>;
	readonly stopRecording: () => Promise<void>;
};

type HtmlInCanvasCaptureProps = {
	readonly children: React.ReactNode;
	readonly density: number;
	readonly filename: string;
};

type WithHtmlInCanvasCaptureProps = {
	readonly density: number;
	readonly filename: string;
};

const canvasStyle: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	width: '100%',
	height: '100%',
	display: 'block',
};

const contentStyle: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	width: '100%',
	height: '100%',
	transformOrigin: 'top left',
};

const fallbackFrameDurationInSeconds = 1 / 60;
const recordingVideoBitrate = 120_000_000;
const recordingKeyFrameIntervalInSeconds = 0.5;

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

const resetCanvas = (
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

const syncCanvasSize = (
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

const downloadBlob = (blob: Blob, filename: string) => {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
	URL.revokeObjectURL(url);
};

const CAPTURE_METADATA_TAG_KEY = 'REMOTION_CAPTURE_DATA';

export {CAPTURE_METADATA_TAG_KEY};

const logCaptureError = (message: string, err: unknown) => {
	// eslint-disable-next-line no-console
	console.error(message, err instanceof Error ? err.message : String(err));
};

const addPaintFrameToRecording = (
	recording: RecordingState,
	source: CanvasVideoSource,
) => {
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
		await source.add(timestampInSeconds, durationInSeconds, {keyFrame});
		recording.frameCount++;
	});
};

const finalizeRecording = async (
	recording: RecordingState,
	filename: string,
) => {
	addPaintFrameToRecording(recording, recording.source);
	await recording.lastFramePromise;

	if (recording.frameCount === 0) {
		throw new Error('No frames were added to the Studio canvas recording.');
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

	downloadBlob(new Blob([remuxTarget.buffer], {type: 'video/webm'}), filename);
};

export const HtmlInCanvasCapture = forwardRef<
	HtmlInCanvasCaptureHandle,
	HtmlInCanvasCaptureProps
>(({children, density, filename}, ref) => {
	if (!Number.isFinite(density) || density <= 0) {
		throw new Error('HTML-in-canvas capture density must be greater than 0.');
	}

	const isSupported = useMemo(() => isHtmlInCanvasAvailable(), []);
	const canvasRef = useRef<HtmlInCanvasElement | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);
	const recordingRef = useRef<RecordingState | null>(null);
	const recordingActionRef = useRef<Promise<void>>(Promise.resolve());

	const requestPaint = useCallback(() => {
		const canvas = canvasRef.current;
		if (typeof canvas?.requestPaint !== 'function') {
			return;
		}

		canvas.requestPaint();
	}, []);

	const startRecording = useCallback(async () => {
		const canvas = canvasRef.current;
		if (!canvas || recordingRef.current) {
			return;
		}

		const {BufferTarget, CanvasSource, Output, WebMOutputFormat} =
			await import('mediabunny');
		const target = new BufferTarget();
		const output = new Output({
			format: new WebMOutputFormat(),
			target,
		});
		const source = new CanvasSource(canvas, {
			codec: 'vp9',
			bitrate: recordingVideoBitrate,
			latencyMode: 'realtime',
			keyFrameInterval: recordingKeyFrameIntervalInSeconds,
		});

		output.addVideoTrack(source);
		await output.start();

		recordingRef.current = {
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
		requestPaint();
	}, [requestPaint]);

	const stopRecording = useCallback(async () => {
		const recording = recordingRef.current;
		if (!recording || recording.isFinalizing) {
			return;
		}

		recording.isFinalizing = true;

		try {
			await finalizeRecording(recording, filename);
		} catch (err) {
			logCaptureError('Could not finalize Studio canvas recording:', err);
			await recording.output.cancel().catch((cancelErr) => {
				logCaptureError('Could not cancel Studio canvas recording:', cancelErr);
			});
		} finally {
			recordingRef.current = null;
		}
	}, [filename]);

	const toggleRecording = useCallback(async () => {
		recordingActionRef.current = recordingActionRef.current.then(async () => {
			if (recordingRef.current) {
				await stopRecording();
				return;
			}

			await startRecording();
		});

		await recordingActionRef.current;
	}, [startRecording, stopRecording]);

	useImperativeHandle(
		ref,
		() => ({
			toggleRecording,
			startRecording,
			stopRecording,
		}),
		[startRecording, stopRecording, toggleRecording],
	);

	const drawCurrentPaint = useCallback(() => {
		const canvas = canvasRef.current;
		const content = contentRef.current;
		if (!canvas || !content) {
			return;
		}

		const context = canvas.getContext(
			'2d',
		) as HtmlInCanvasRenderingContext2D | null;
		if (!context || typeof context.drawElementImage !== 'function') {
			throw new Error('drawElementImage() is not available.');
		}

		const rect = content.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) {
			return;
		}

		syncCanvasSize(canvas, rect.width, rect.height, density);
		resetCanvas(context, canvas);
		context.scale(density, density);
		context.drawElementImage(content, 0, 0, rect.width, rect.height);

		const recording = recordingRef.current;
		if (recording && !recording.isFinalizing) {
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
			addPaintFrameToRecording(recording, recording.source);
		}
	}, [density]);

	useEffect(() => {
		const onMouseMove = (event: MouseEvent) => {
			const recording = recordingRef.current;
			if (!recording || recording.isFinalizing) {
				return;
			}

			const rect = contentRef.current?.getBoundingClientRect();

			recording.mouseMovements.push({
				timeInSeconds: (performance.now() - recording.startedAt) / 1000,
				clientX: event.clientX,
				clientY: event.clientY,
				pageX: event.pageX,
				pageY: event.pageY,
				canvasX: rect ? (event.clientX - rect.left) * density : null,
				canvasY: rect ? (event.clientY - rect.top) * density : null,
				cursor: getCursorForElement(
					document.elementFromPoint(event.clientX, event.clientY),
				),
			});
		};

		window.addEventListener('pointermove', onMouseMove);

		return () => {
			window.removeEventListener('pointermove', onMouseMove);
		};
	}, [density]);

	useEffect(() => {
		const onPointerDown = () => {
			const recording = recordingRef.current;
			if (!recording || recording.isFinalizing) {
				return;
			}

			recording.pointerClicks.push({
				timeInSeconds: (performance.now() - recording.startedAt) / 1000,
				type: 'pointer-down',
			});
		};

		const onPointerUp = () => {
			const recording = recordingRef.current;
			if (!recording || recording.isFinalizing) {
				return;
			}

			recording.pointerClicks.push({
				timeInSeconds: (performance.now() - recording.startedAt) / 1000,
				type: 'pointer-up',
			});
		};

		window.addEventListener('pointerdown', onPointerDown, true);
		window.addEventListener('pointerup', onPointerUp, true);

		return () => {
			window.removeEventListener('pointerdown', onPointerDown, true);
			window.removeEventListener('pointerup', onPointerUp, true);
		};
	}, []);

	useEffect(() => {
		if (!isSupported) {
			return;
		}

		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		canvas.setAttribute('layoutsubtree', '');
		canvas.layoutSubtree = true;

		const onPaint = () => {
			try {
				drawCurrentPaint();
			} catch (err) {
				logCaptureError('Could not capture Studio canvas paint:', err);
			}
		};

		canvas.addEventListener('paint', onPaint as EventListener);
		const frame = requestAnimationFrame(requestPaint);

		return () => {
			cancelAnimationFrame(frame);
			canvas.removeEventListener('paint', onPaint as EventListener);
		};
	}, [drawCurrentPaint, isSupported, requestPaint]);

	useEffect(() => {
		if (!isSupported) {
			return;
		}

		const content = contentRef.current;
		const canvas = canvasRef.current;
		if (!content || !canvas) {
			return;
		}

		const resizeObserver = new ResizeObserver(([entry]) => {
			const {width, height} = entry.contentRect;
			syncCanvasSize(canvas, width, height, density);
			requestPaint();
		});

		resizeObserver.observe(content);

		return () => {
			resizeObserver.disconnect();
		};
	}, [density, isSupported, requestPaint]);

	useEffect(() => {
		return () => {
			const recording = recordingRef.current;
			if (!recording || recording.isFinalizing) {
				return;
			}

			recording.isFinalizing = true;
			recording.output.cancel().catch((err) => {
				logCaptureError('Could not cancel Studio canvas recording:', err);
			});
			recordingRef.current = null;
		};
	}, []);

	if (!isSupported) {
		return children;
	}

	return (
		<canvas ref={canvasRef} style={canvasStyle}>
			<div ref={contentRef} style={contentStyle}>
				{children}
			</div>
		</canvas>
	);
});

export const withHtmlInCanvasCapture = <Props extends object>(
	Component: React.ComponentType<Props>,
) => {
	return forwardRef<
		HtmlInCanvasCaptureHandle,
		Props & WithHtmlInCanvasCaptureProps
	>(({density, filename, ...props}, ref) => {
		return (
			<HtmlInCanvasCapture ref={ref} density={density} filename={filename}>
				<Component {...(props as Props)} />
			</HtmlInCanvasCapture>
		);
	});
};
