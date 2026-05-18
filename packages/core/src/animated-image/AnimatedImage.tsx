import type React from 'react';
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import {cancelRender} from '../cancel-render.js';
import type {SequenceControls} from '../CompositionManager.js';
import {addSequenceStackTraces} from '../enable-sequence-stack-traces.js';
import {
	hiddenField,
	sequenceStyleSchema,
	type SequenceSchema,
} from '../sequence-field-schema.js';
import {Sequence} from '../Sequence.js';
import {useCurrentFrame} from '../use-current-frame.js';
import {useDelayRender} from '../use-delay-render.js';
import {useVideoConfig} from '../use-video-config.js';
import {wrapInSchema} from '../wrap-in-schema.js';
import type {AnimatedImageCanvasRef} from './canvas';
import {Canvas} from './canvas';
import type {RemotionImageDecoder} from './decode-image.js';
import {decodeImage} from './decode-image.js';
import type {AnimatedImageProps, RemotionAnimatedImageProps} from './props';
import {resolveAnimatedImageSource} from './resolve-image-source';

const animatedImageSchema = {
	playbackRate: {
		type: 'number',
		min: 0,
		max: 10,
		step: 0.1,
		default: 1,
		description: 'Playback Rate',
	},
	...sequenceStyleSchema,
	hidden: hiddenField,
} as const satisfies SequenceSchema;

const AnimatedImageContent = forwardRef<
	HTMLCanvasElement,
	RemotionAnimatedImageProps
>(
	(
		{
			src,
			width,
			height,
			onError,
			loopBehavior = 'loop',
			playbackRate = 1,
			fit = 'fill',
			...props
		},
		canvasRef,
	) => {
		const mountState = useRef({isMounted: true});

		useEffect(() => {
			const {current} = mountState;
			current.isMounted = true;
			return () => {
				current.isMounted = false;
			};
		}, []);

		const resolvedSrc = resolveAnimatedImageSource(src);
		const [imageDecoder, setImageDecoder] =
			useState<RemotionImageDecoder | null>(null);
		const {delayRender, continueRender} = useDelayRender();

		const [decodeHandle] = useState(() =>
			delayRender(`Rendering <AnimatedImage/> with src="${resolvedSrc}"`),
		);

		const frame = useCurrentFrame();
		const {fps} = useVideoConfig();
		const currentTime = frame / playbackRate / fps;
		const currentTimeRef = useRef<number>(currentTime);
		currentTimeRef.current = currentTime;

		const ref = useRef<AnimatedImageCanvasRef>(null);

		useImperativeHandle(canvasRef, () => {
			const c = ref.current?.getCanvas();
			if (!c) {
				throw new Error('Canvas ref is not set');
			}

			return c;
		}, []);

		const [initialLoopBehavior] = useState(() => loopBehavior);

		useEffect(() => {
			const controller = new AbortController();
			decodeImage({
				resolvedSrc,
				signal: controller.signal,
				currentTime: currentTimeRef.current,
				initialLoopBehavior,
			})
				.then((d) => {
					setImageDecoder(d);
					continueRender(decodeHandle);
				})
				.catch((err) => {
					if ((err as Error).name === 'AbortError') {
						continueRender(decodeHandle);

						return;
					}

					if (onError) {
						onError?.(err as Error);
						continueRender(decodeHandle);
					} else {
						cancelRender(err);
					}
				});

			return () => {
				controller.abort();
			};
		}, [
			resolvedSrc,
			decodeHandle,
			onError,
			initialLoopBehavior,
			continueRender,
		]);

		useLayoutEffect(() => {
			if (!imageDecoder) {
				return;
			}

			const delay = delayRender(
				`Rendering frame at ${currentTime} of <AnimatedImage src="${src}"/>`,
			);

			imageDecoder
				.getFrame(currentTime, loopBehavior)
				.then((videoFrame) => {
					if (mountState.current.isMounted) {
						if (videoFrame === null) {
							ref.current?.clear();
						} else {
							ref.current?.draw(videoFrame.frame!);
						}
					}

					continueRender(delay);
				})
				.catch((err) => {
					if (onError) {
						onError(err as Error);
						continueRender(delay);
					} else {
						cancelRender(err);
					}
				});
		}, [
			currentTime,
			imageDecoder,
			loopBehavior,
			onError,
			src,
			continueRender,
			delayRender,
		]);

		return (
			<Canvas ref={ref} width={width} height={height} fit={fit} {...props} />
		);
	},
);

AnimatedImageContent.displayName = 'AnimatedImageContent';

const AnimatedImageInner = ({
	src,
	width,
	height,
	onError,
	fit,
	playbackRate,
	loopBehavior,
	id,
	className,
	style,
	durationInFrames,
	_experimentalControls: controls,
	ref,
	...sequenceProps
}: AnimatedImageProps & {
	readonly _experimentalControls?: SequenceControls | undefined;
	readonly ref?: React.Ref<HTMLCanvasElement>;
}) => {
	const {durationInFrames: videoDuration} = useVideoConfig();
	const resolvedDuration = durationInFrames ?? videoDuration;

	const animatedImageProps: RemotionAnimatedImageProps = {
		src,
		width,
		height,
		onError,
		fit,
		playbackRate,
		loopBehavior,
		id,
		className,
		style,
	};

	return (
		<Sequence
			layout="none"
			durationInFrames={resolvedDuration}
			name="<AnimatedImage>"
			_experimentalControls={controls}
			{...sequenceProps}
		>
			<AnimatedImageContent {...animatedImageProps} ref={ref} />
		</Sequence>
	);
};

export const AnimatedImage = wrapInSchema(
	AnimatedImageInner,
	animatedImageSchema,
);

AnimatedImage.displayName = 'AnimatedImage';

addSequenceStackTraces(AnimatedImage);
