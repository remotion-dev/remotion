import {
	makeHtmlInCanvasPresentation,
	type HtmlInCanvasShader,
	type TransitionPresentation,
	type TransitionPresentationComponentProps,
} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {Easing, HtmlInCanvas, useRemotionEnvironment} from 'remotion';

type PaneSlideProps = {
	readonly direction: 'from-top' | 'from-bottom';
};

type PaneSlideDrawProps = PaneSlideProps & {
	readonly durationInFrames: number;
	readonly shutterAngle: number;
	readonly samples: number;
};

const easing = Easing.bezier(0.4, 0, 0.2, 1);

const paneSlideShader: HtmlInCanvasShader<PaneSlideDrawProps> = (canvas) => {
	const context = canvas.getContext('2d', {
		colorSpace: 'srgb',
		colorType: 'float16',
	});
	const sampleCanvas = new OffscreenCanvas(1, 1);
	const sampleContext = sampleCanvas.getContext('2d');
	if (!context || !sampleContext) {
		throw new Error('Failed to create pane slide canvas context');
	}

	return {
		clear: () => context.reset(),
		cleanup: () => {
			sampleCanvas.width = 0;
			sampleCanvas.height = 0;
		},
		draw: ({prevImage, nextImage, width, height, time, passedProps}) => {
			context.reset();
			if (!prevImage || !nextImage) {
				const image = prevImage ?? nextImage;
				if (image) {
					context.drawImage(image, 0, 0, width, height);
				}

				return;
			}

			if (sampleCanvas.width !== width || sampleCanvas.height !== height) {
				sampleCanvas.width = width;
				sampleCanvas.height = height;
			}

			const {direction, durationInFrames, shutterAngle, samples} = passedProps;
			context.globalCompositeOperation = 'lighter';
			context.globalAlpha = 1 / samples;
			for (let i = 0; i < samples; i++) {
				const offset = ((i + 0.5) / samples - 0.5) * (shutterAngle / 360);
				const progress = easing(
					Math.max(0, Math.min(1, time + offset / durationInFrames)),
				);
				const correctedProgress = progress === 1 ? progress : progress - 0.0001;
				const outgoingY =
					direction === 'from-top' ? correctedProgress : -progress;
				const incomingY =
					direction === 'from-top' ? progress - 1 : 1 - correctedProgress;

				// TransitionSeries supplies the entering scene as prevImage.
				// Composite each exposure before averaging to preserve transparent edges.
				sampleContext.reset();
				sampleContext.drawImage(
					nextImage,
					0,
					outgoingY * height,
					width,
					height,
				);
				sampleContext.drawImage(
					prevImage,
					0,
					incomingY * height,
					width,
					height,
				);
				context.drawImage(sampleCanvas, 0, 0);
			}
		},
	};
};

const makeCanvasPaneSlide = makeHtmlInCanvasPresentation(paneSlideShader);
const FallbackSlide = slide().component;

const PaneSlide = (
	props: TransitionPresentationComponentProps<PaneSlideProps>,
) => {
	const {isRendering} = useRemotionEnvironment();
	if (!isRendering && !HtmlInCanvas.isSupported()) {
		return (
			<FallbackSlide
				{...props}
				presentationProgress={easing(props.presentationProgress)}
			/>
		);
	}

	const {component: CanvasPaneSlide, props: passedProps} = makeCanvasPaneSlide({
		...props.passedProps,
		durationInFrames: props.presentationDurationInFrames,
		shutterAngle: isRendering ? 180 : 90,
		samples: isRendering ? 32 : 16,
	});

	return <CanvasPaneSlide {...props} passedProps={passedProps} />;
};

export const paneSlide = (
	props: PaneSlideProps,
): TransitionPresentation<PaneSlideProps> => ({component: PaneSlide, props});
