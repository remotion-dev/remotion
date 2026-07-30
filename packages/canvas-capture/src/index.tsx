import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from 'react';
import {
	CanvasCaptureRecorder,
	type HtmlInCanvasElement,
	type HtmlInCanvasRenderingContext2D,
	isHtmlInCanvasAvailable,
	resetCanvas,
	syncCanvasSize,
} from './recorder';

export {
	CanvasCaptureRecorder,
	CAPTURE_METADATA_TAG_KEY,
	isHtmlInCanvasAvailable,
} from './recorder';
export type {CanvasCaptureRecorderOptions} from './recorder';

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

const logCaptureError = (message: string, err: unknown) => {
	// eslint-disable-next-line no-console
	console.error(message, err instanceof Error ? err.message : String(err));
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
	const recorderRef = useRef<CanvasCaptureRecorder | null>(null);
	const recordingActionRef = useRef<Promise<void>>(Promise.resolve());
	const densityRef = useRef(density);
	const filenameRef = useRef(filename);
	densityRef.current = density;
	filenameRef.current = filename;

	const requestPaint = useCallback(() => {
		const canvas = canvasRef.current;
		if (typeof canvas?.requestPaint !== 'function') {
			return;
		}

		canvas.requestPaint();
	}, []);

	const startRecording = useCallback(async () => {
		await recorderRef.current?.startRecording();
		requestPaint();
	}, [requestPaint]);

	const stopRecording = useCallback(async () => {
		try {
			await recorderRef.current?.stopRecording();
		} catch (err) {
			logCaptureError('Could not finalize Studio canvas recording:', err);
		}
	}, []);

	const toggleRecording = useCallback(async () => {
		recordingActionRef.current = recordingActionRef.current.then(async () => {
			if (recorderRef.current?.isRecording()) {
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

		const currentDensity = densityRef.current;
		syncCanvasSize(canvas, rect.width, rect.height, currentDensity);
		resetCanvas(context, canvas);
		context.scale(currentDensity, currentDensity);
		context.drawElementImage(content, 0, 0, rect.width, rect.height);
		recorderRef.current?.addFrame();
	}, []);

	useEffect(() => {
		if (!isSupported) {
			return;
		}

		const canvas = canvasRef.current;
		const content = contentRef.current;
		if (!canvas || !content) {
			return;
		}

		const recorder = new CanvasCaptureRecorder({
			canvas,
			getContentRect: () => content.getBoundingClientRect(),
			getDensity: () => densityRef.current,
			getFilename: () => filenameRef.current,
		});
		recorderRef.current = recorder;

		return () => {
			recorder.dispose();
			recorderRef.current = null;
		};
	}, [isSupported]);

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
