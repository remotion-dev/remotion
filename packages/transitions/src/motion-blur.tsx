import {MotionBlurInternals} from '@remotion/motion-blur';
import {
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useState,
} from 'react';
import {
	HtmlInCanvas,
	Internals,
	useDelayRender,
	useRemotionEnvironment,
} from 'remotion';
import type {EffectsProp, EffectsOutputSize} from 'remotion';
import {
	HtmlInCanvasPresentation,
	type HtmlInCanvasShader,
} from './html-in-canvas-presentation';
import type {
	TransitionMotionBlur,
	TransitionPresentation,
	TransitionPresentationComponentProps,
	TransitionTiming,
} from './types';

type MotionBlurPresentationProps = {
	presentation: TransitionPresentation<Record<string, unknown>>;
	shader: HtmlInCanvasShader<Record<string, unknown>>;
	timing: TransitionTiming;
	frame: number;
	fps: number;
	shutterAngle: number;
	samples: number;
};

const createMotionBlurShader =
	({
		device,
		preferWebGl,
		requestPaint,
	}: {
		readonly device: GPUDevice | null;
		readonly preferWebGl: boolean;
		readonly requestPaint: () => void;
	}): HtmlInCanvasShader<MotionBlurPresentationProps> =>
	(canvas) => {
		const context = canvas.getContext('2d', {
			colorSpace: 'srgb',
			colorType: 'float16',
		});
		if (!context) {
			throw new Error('Failed to create motion blur canvas context');
		}

		let sampleCanvas: OffscreenCanvas | null = null;
		let shader: HtmlInCanvasShader<Record<string, unknown>> | null = null;
		let instance: ReturnType<
			HtmlInCanvasShader<Record<string, unknown>>
		> | null = null;
		let compositor: ReturnType<
			typeof MotionBlurInternals.createMotionBlurCompositor
		> | null = null;
		let compositorWidth = 0;
		let compositorHeight = 0;

		return {
			clear: () => context.reset(),
			cleanup: () => {
				instance?.cleanup();
				compositor?.dispose();
				if (sampleCanvas) {
					sampleCanvas.width = 0;
					sampleCanvas.height = 0;
				}
			},
			draw: ({
				prevImage,
				nextImage,
				width,
				height,
				pixelRatio,
				passedProps,
			}) => {
				context.reset();
				if (!prevImage && !nextImage) {
					return;
				}

				if (shader !== passedProps.shader || !sampleCanvas || !instance) {
					instance?.cleanup();
					sampleCanvas = new OffscreenCanvas(width, height);
					shader = passedProps.shader;
					instance = shader(sampleCanvas);
				}

				if (sampleCanvas.width !== width || sampleCanvas.height !== height) {
					sampleCanvas.width = width;
					sampleCanvas.height = height;
				}

				const {samples, shutterAngle, timing, frame, fps, presentation} =
					passedProps;
				const duration = timing.getDurationInFrames({fps});
				const sampleCount =
					shutterAngle === 0 ||
					!prevImage ||
					!nextImage ||
					frame < 0 ||
					frame >= duration
						? 1
						: samples;
				const needsCompositor =
					shutterAngle > 0 && samples > 1 && frame < duration;
				if (
					compositor &&
					(!needsCompositor ||
						compositorWidth !== width ||
						compositorHeight !== height ||
						compositor.isLost())
				) {
					compositor.dispose();
					compositor = null;
				}

				if (needsCompositor && compositor === null) {
					compositor = MotionBlurInternals.createMotionBlurCompositor({
						width,
						height,
						device: preferWebGl ? null : device,
						requestPaint,
					});
					compositorWidth = width;
					compositorHeight = height;
					compositor.addSample(sampleCanvas, 0, 1);
					compositor.finish();
				}

				const sampleWeight = 1 / sampleCount;
				for (let i = 0; i < sampleCount; i++) {
					const offset = ((i + 0.5) / sampleCount - 0.5) * (shutterAngle / 360);
					const progress = timing.getProgress({
						frame: Math.max(0, Math.min(duration, frame + offset)),
						fps,
					});
					instance.clear();
					instance.draw({
						prevImage,
						nextImage,
						width,
						height,
						time: progress,
						pixelRatio,
						presentationDurationInFrames: duration,
						passedProps: presentation.props,
					});
					if (compositor && sampleCount > 1) {
						compositor.addSample(sampleCanvas, i, sampleWeight);
					} else {
						context.drawImage(sampleCanvas, 0, 0);
					}
				}

				if (compositor && sampleCount > 1) {
					context.drawImage(compositor.finish(), 0, 0);
				}
			},
		};
	};

const MotionBlurPresentation = (
	props: TransitionPresentationComponentProps<MotionBlurPresentationProps>,
) => {
	const {isRendering} = useRemotionEnvironment();
	const canvasSupported = isRendering || HtmlInCanvas.isSupported();
	const videoEnabled = Internals.useVideoEnabled();
	const preferredBackend = useContext(Internals.PreferredEffectBackendContext);
	const preferWebGl =
		typeof window !== 'undefined' &&
		((preferredBackend ?? window.remotion_preferredEffectBackend) ===
			'webgl2' ||
			Boolean(window.remotion_disableWebGpuEffects));
	const {delayRender, continueRender, cancelRender} = useDelayRender();
	const [gpuState, setGpuState] = useState<{device: GPUDevice | null}>({
		device: null,
	});
	const requestPaint = useCallback(() => {
		setGpuState(({device}) => ({device}));
	}, []);

	useLayoutEffect(() => {
		if (!canvasSupported || !videoEnabled || preferWebGl) {
			return;
		}

		let active = true;
		const handle = delayRender('Initializing transition motion blur');
		MotionBlurInternals.getMotionBlurGpuDevice()
			.then((device) => {
				if (active) {
					setGpuState({device});
				}

				continueRender(handle);
			})
			.catch((error) => {
				if (active) {
					cancelRender(error);
				}
			});

		return () => {
			active = false;
			continueRender(handle);
		};
	}, [
		canvasSupported,
		videoEnabled,
		preferWebGl,
		delayRender,
		continueRender,
		cancelRender,
	]);

	const shader = useMemo(
		() =>
			createMotionBlurShader({
				device: gpuState.device,
				preferWebGl,
				requestPaint,
			}),
		[gpuState, preferWebGl, requestPaint],
	);

	if (!canvasSupported) {
		const Fallback = props.passedProps.presentation.component;
		return (
			<Internals.HtmlInCanvasFallback
				label="Motion blur is not visible"
				style={{position: 'absolute', inset: 0}}
			>
				<Fallback
					{...props}
					passedProps={props.passedProps.presentation.props}
				/>
			</Internals.HtmlInCanvasFallback>
		);
	}

	return (
		<HtmlInCanvasPresentation
			{...props}
			shader={shader}
			effects={
				(props.passedProps.presentation.props.effects as
					| EffectsProp
					| undefined) ?? null
			}
			effectsOutputSize={
				(props.passedProps.presentation.props.effectsOutputSize as
					| EffectsOutputSize
					| undefined) ?? null
			}
		/>
	);
};

export const resolveMotionBlurPresentation = ({
	presentation,
	motionBlur,
	timing,
	frame,
	fps,
}: {
	presentation: TransitionPresentation<Record<string, unknown>>;
	motionBlur: TransitionMotionBlur | null;
	timing: TransitionTiming;
	frame: number;
	fps: number;
}): TransitionPresentation<Record<string, unknown>> => {
	if (!motionBlur) {
		return presentation;
	}

	const {samples = 16, shutterAngle = 180} = motionBlur;
	if (!Number.isInteger(samples) || samples < 1) {
		throw new TypeError('motionBlur.samples must be a positive integer');
	}

	if (!Number.isFinite(shutterAngle) || shutterAngle < 0) {
		throw new TypeError(
			'motionBlur.shutterAngle must be a non-negative finite number',
		);
	}

	if (!presentation.canvas) {
		throw new TypeError(
			'This presentation does not provide a canvas renderer for motionBlur. Use a built-in presentation without CSS style overrides, a presentation made with makeHtmlInCanvasPresentation(), or provide a canvas renderer on your custom presentation.',
		);
	}

	return {
		component: MotionBlurPresentation as TransitionPresentation<
			Record<string, unknown>
		>['component'],
		props: {
			presentation,
			shader: presentation.canvas,
			timing,
			frame,
			fps,
			samples,
			shutterAngle,
		} satisfies MotionBlurPresentationProps,
	};
};
