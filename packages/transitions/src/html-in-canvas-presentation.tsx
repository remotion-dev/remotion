import {useLayoutEffect, useMemo, useRef, useState, useCallback} from 'react';
import {HtmlInCanvas, useDelayRender, type EffectsProp} from 'remotion';
import {AbsoluteFill, Internals, useCurrentFrame} from 'remotion';
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
	_experimentalEffects,
	passedProps,
	bothEnteringAndExiting,
}: TransitionPresentationComponentProps<TPassedProps> & {
	readonly shader: HtmlInCanvasShader<TPassedProps>;
	readonly _experimentalEffects?: EffectsProp;
}) => {
	if (!HtmlInCanvas.isSupported()) {
		throw new Error(
			'HTML in Canvas is not supported. Open this page in Chrome Canary with chrome://flags/#canvas-draw-element enabled.',
		);
	}

	const canvasRef = useRef<HTMLCanvasElement>(null);
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

	const [offscreenCanvas] = useState(() => new OffscreenCanvas(1, 1));

	const passedPropsRef = useRef(passedProps);
	passedPropsRef.current = passedProps;

	const frame = useCurrentFrame();
	const frameRef = useRef(frame);
	frameRef.current = frame;

	const effectsRef = useRef(_experimentalEffects);
	effectsRef.current = _experimentalEffects;

	const [instance] = useState(() => shader(offscreenCanvas));

	useLayoutEffect(() => {
		return () => {
			instance.cleanup();
		};
	}, [offscreenCanvas, instance]);

	const chainState = Internals.useEffectChainState();
	const {delayRender, continueRender} = useDelayRender();

	const draw: DrawFunction = useCallback(
		async (prevImage, nextImage, progress) => {
			if (!canvasRef.current) {
				throw new Error('Canvas not found');
			}

			const handle = delayRender('onPaint');

			if (!prevImage && !nextImage) {
				continueRender(handle);
				instance.clear();
				return;
			}

			const width = prevImage?.width ?? nextImage?.width ?? 0;
			const height = prevImage?.height ?? nextImage?.height ?? 0;

			if (width === 0 || height === 0) {
				continueRender(handle);
				instance.clear();
				return;
			}

			offscreenCanvas.width = width;
			offscreenCanvas.height = height;

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
				source: offscreenCanvas,
				effects: effectsRef.current ?? [],
				frame: frameRef.current,
				width,
				height,
				output: canvasRef.current,
			});
			continueRender(handle);
		},
		[chainState, instance, offscreenCanvas, continueRender, delayRender],
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

			if (!firstChild) {
				return;
			}

			const elementImage = canvas.captureElementImage(firstChild);
			onElementImage(elementImage, draw);
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
	}, [presentationProgress, passThrough]);

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
			canvas.width = entry.devicePixelContentBoxSize[0].inlineSize;
			canvas.height = entry.devicePixelContentBoxSize[0].blockSize;
		});
		observer.observe(canvas, {box: 'device-pixel-content-box'});
	}, [passThrough]);

	if (passThrough) {
		return children;
	}

	return (
		<AbsoluteFill>
			<canvas ref={canvasRef} style={canvasSubtreeStyle}>
				{children}
			</canvas>
		</AbsoluteFill>
	);
};

export type HtmlInCanvasShaderDrawParams<Props> = {
	prevImage: ElementImage | null;
	nextImage: ElementImage | null;
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
	type AugmentedProps = TPassedProps & {_experimentalEffects?: EffectsProp};
	const CompWithShader: React.FC<
		TransitionPresentationComponentProps<AugmentedProps>
	> = (props) => {
		const {passedProps, ...otherProps} = props;
		const {_experimentalEffects, ...restPassedProps} = props.passedProps;
		return (
			<HtmlInCanvasPresentation
				shader={shader}
				passedProps={restPassedProps as TPassedProps}
				_experimentalEffects={_experimentalEffects}
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
