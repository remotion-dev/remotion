import {useCallback, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {
	AbsoluteFill,
	HTML_IN_CANVAS_UNSUPPORTED_MESSAGE,
	HtmlInCanvas,
	Internals,
	useDelayRender,
	type EffectsProp,
} from 'remotion';
import type {DrawFunction} from './TransitionSeries';
import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from './types';

export const HtmlInCanvasPresentation = <
	TPassedProps extends Record<string, unknown>,
>({
	children,
	onElementImage,
	onUnmount,
	presentationProgress,
	presentationDirection,
	shader,
	effects,
	passedProps,
	bothEnteringAndExiting,
}: TransitionPresentationComponentProps<TPassedProps> & {
	readonly shader: HtmlInCanvasShader<TPassedProps>;
	readonly effects?: EffectsProp;
}) => {
	if (!HtmlInCanvas.isSupported()) {
		throw new Error(HTML_IN_CANVAS_UNSUPPORTED_MESSAGE);
	}

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const outputCanvasRef = useRef<HTMLCanvasElement>(null);
	const canvasSubtreeStyle: React.CSSProperties = useMemo(() => {
		return {
			width: '100%',
			height: '100%',
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
		};
	}, []);
	const outputCanvasStyle: React.CSSProperties = useMemo(() => {
		return {
			width: '100%',
			height: '100%',
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			pointerEvents: 'none',
		};
	}, []);

	const captureCanvasRef = useRef<OffscreenCanvas | null>(null);
	const captureContextRef = useRef<OffscreenCanvasRenderingContext2D | null>(
		null,
	);
	const [shaderCanvas] = useState(() => new OffscreenCanvas(1, 1));

	const passedPropsRef = useRef(passedProps);
	passedPropsRef.current = passedProps;

	const memoizedEffects = Internals.useMemoizedEffects({
		effects: effects ?? [],
		overrideId: null,
	});

	const effectsRef = useRef(memoizedEffects);
	effectsRef.current = memoizedEffects;

	const [instance] = useState(() => shader(shaderCanvas));

	useLayoutEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return () => {
				instance.cleanup();
			};
		}

		const captureCanvas = canvas.transferControlToOffscreen();
		const captureContext = captureCanvas.getContext('2d');
		if (!captureContext) {
			throw new Error('Failed to create capture canvas context');
		}

		captureCanvasRef.current = captureCanvas;
		captureContextRef.current = captureContext;

		return () => {
			instance.cleanup();
			captureCanvasRef.current = null;
			captureContextRef.current = null;
		};
	}, [instance]);

	const chainState = Internals.useEffectChainState();
	const {delayRender, continueRender} = useDelayRender();

	const draw: DrawFunction = useCallback(
		async (prevImage, nextImage, progress) => {
			const outputCanvas = outputCanvasRef.current;
			if (!outputCanvas) {
				throw new Error('Canvas not found');
			}

			const handle = delayRender('onPaint');
			const clearOutput = () => {
				const context = outputCanvas.getContext('2d');
				if (!context) {
					throw new Error('Failed to create output canvas context');
				}

				context.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
			};

			if (!prevImage && !nextImage) {
				instance.clear();
				clearOutput();
				continueRender(handle);
				return;
			}

			const width = prevImage?.width ?? nextImage?.width ?? 0;
			const height = prevImage?.height ?? nextImage?.height ?? 0;

			if (width === 0 || height === 0) {
				instance.clear();
				clearOutput();
				continueRender(handle);
				return;
			}

			shaderCanvas.width = width;
			shaderCanvas.height = height;

			instance.draw({
				prevImage,
				nextImage,
				width,
				height,
				time: progress,
				passedProps: passedPropsRef.current,
			});

			await Internals.runEffectChain({
				state: chainState.get(width, height)!,
				source: shaderCanvas,
				effects: effectsRef.current ?? [],
				width,
				height,
				output: outputCanvas,
			});
			continueRender(handle);
		},
		[chainState, continueRender, delayRender, instance, shaderCanvas],
	);

	const passThrough =
		bothEnteringAndExiting && presentationDirection === 'exiting';

	useLayoutEffect(() => {
		if (passThrough) {
			return;
		}

		const canvas = canvasRef.current;
		if (!canvas) {
			throw new Error('Canvas not found');
		}

		canvas.layoutSubtree = true;

		const onPaint = () => {
			const firstChild = canvas.firstChild as HTMLElement;
			const captureCanvas = captureCanvasRef.current;
			const captureContext = captureContextRef.current;

			if (!firstChild || !captureCanvas || !captureContext) {
				return;
			}

			const elementImage = canvas.captureElementImage(firstChild);
			try {
				captureContext.reset();
				captureContext.drawElementImage(elementImage, 0, 0);
			} finally {
				elementImage.close();
			}

			onElementImage(captureCanvas, draw);
		};

		canvas.addEventListener('paint', onPaint);

		return () => {
			canvas.removeEventListener('paint', onPaint);
		};
	}, [onElementImage, presentationDirection, draw, passThrough]);

	useLayoutEffect(() => {
		if (passThrough) {
			return;
		}

		const canvas = canvasRef.current;
		if (!canvas) {
			throw new Error('Canvas not found');
		}

		canvas.requestPaint?.();
	}, [presentationProgress, passThrough, memoizedEffects]);

	useLayoutEffect(() => {
		if (passThrough) {
			return;
		}

		return () => {
			onUnmount();
		};
	}, [onUnmount, passThrough]);

	useLayoutEffect(() => {
		if (passThrough) {
			return;
		}

		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		// Size the canvas grid to match the device scale factor to prevent blurriness.
		const observer = new ResizeObserver(([entry]) => {
			const outputCanvas = outputCanvasRef.current;
			const captureCanvas = captureCanvasRef.current;
			if (!outputCanvas || !captureCanvas) {
				return;
			}

			const width = entry.devicePixelContentBoxSize[0].inlineSize;
			const height = entry.devicePixelContentBoxSize[0].blockSize;
			captureCanvas.width = width;
			captureCanvas.height = height;
			outputCanvas.width = width;
			outputCanvas.height = height;
			canvas.requestPaint?.();
		});
		observer.observe(canvas, {box: 'device-pixel-content-box'});

		return () => {
			observer.disconnect();
		};
	}, [passThrough]);

	if (passThrough) {
		return children;
	}

	return (
		<AbsoluteFill>
			<canvas ref={canvasRef} style={canvasSubtreeStyle}>
				{children}
			</canvas>
			<canvas ref={outputCanvasRef} style={outputCanvasStyle} />
		</AbsoluteFill>
	);
};

export type HtmlInCanvasShaderDrawParams<Props> = {
	prevImage: OffscreenCanvas | null;
	nextImage: OffscreenCanvas | null;
	width: number;
	height: number;
	time: number;
	passedProps: Props;
};

export type HtmlInCanvasShaderDraw<Props> = (
	params: HtmlInCanvasShaderDrawParams<Props>,
) => void;

export type HtmlInCanvasShader<Props> = (canvas: OffscreenCanvas) => {
	clear: () => void;
	cleanup: () => void;
	draw: HtmlInCanvasShaderDraw<Props>;
};

export const makeHtmlInCanvasPresentation = <
	TPassedProps extends Record<string, unknown>,
>(
	shader: HtmlInCanvasShader<TPassedProps>,
) => {
	type AugmentedProps = TPassedProps & {effects?: EffectsProp};
	const CompWithShader: React.FC<
		TransitionPresentationComponentProps<AugmentedProps>
	> = (props) => {
		const {passedProps, ...otherProps} = props;
		const {effects, ...restPassedProps} = props.passedProps;
		return (
			<HtmlInCanvasPresentation
				shader={shader}
				passedProps={restPassedProps as TPassedProps}
				effects={effects}
				{...otherProps}
			/>
		);
	};

	return (props: AugmentedProps): TransitionPresentation<AugmentedProps> => {
		return {
			component: CompWithShader,
			props,
		};
	};
};
