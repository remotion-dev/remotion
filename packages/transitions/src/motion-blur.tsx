import {HtmlInCanvas, Internals, useRemotionEnvironment} from 'remotion';
import type {EffectsProp, EffectsOutputSize} from 'remotion';
import {
	makeHtmlInCanvasPresentation,
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

const motionBlurShader: HtmlInCanvasShader<MotionBlurPresentationProps> = (
	canvas,
) => {
	const context = canvas.getContext('2d', {
		colorSpace: 'srgb',
		colorType: 'float16',
	});
	if (!context) {
		throw new Error('Failed to create motion blur canvas context');
	}

	let sampleCanvas: OffscreenCanvas | null = null;
	let shader: HtmlInCanvasShader<Record<string, unknown>> | null = null;
	let instance: ReturnType<HtmlInCanvasShader<Record<string, unknown>>> | null =
		null;

	return {
		clear: () => context.reset(),
		cleanup: () => {
			instance?.cleanup();
			if (sampleCanvas) {
				sampleCanvas.width = 0;
				sampleCanvas.height = 0;
			}
		},
		draw: ({prevImage, nextImage, width, height, passedProps}) => {
			context.reset();
			if (!prevImage || !nextImage) {
				const image = prevImage ?? nextImage;
				if (image) {
					context.drawImage(image, 0, 0, width, height);
				}

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
			const sampleCount = shutterAngle === 0 ? 1 : samples;
			const duration = timing.getDurationInFrames({fps});
			context.globalCompositeOperation = 'lighter';
			context.globalAlpha = 1 / sampleCount;
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
					passedProps: presentation.props,
				});
				context.drawImage(sampleCanvas, 0, 0);
			}
		},
	};
};

const canvasMotionBlur = makeHtmlInCanvasPresentation(motionBlurShader);

const MotionBlurPresentation = (
	props: TransitionPresentationComponentProps<MotionBlurPresentationProps>,
) => {
	const {isRendering} = useRemotionEnvironment();
	if (!isRendering && !HtmlInCanvas.isSupported()) {
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

	const {component: CanvasPresentation, props: passedProps} = canvasMotionBlur({
		...props.passedProps,
		effects: props.passedProps.presentation.props.effects as
			| EffectsProp
			| undefined,
		effectsOutputSize: props.passedProps.presentation.props.effectsOutputSize as
			| EffectsOutputSize
			| undefined,
	});
	return <CanvasPresentation {...props} passedProps={passedProps} />;
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

	if (
		!Number.isFinite(shutterAngle) ||
		shutterAngle < 0 ||
		shutterAngle > 360
	) {
		throw new TypeError('motionBlur.shutterAngle must be between 0 and 360');
	}

	if (!presentation.canvas) {
		throw new TypeError(
			'This presentation does not provide a canvas renderer for motionBlur. Use slide() without enterStyle/exitStyle, a presentation made with makeHtmlInCanvasPresentation(), or provide a canvas renderer on your custom presentation.',
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
