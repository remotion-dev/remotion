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
import type {EffectsProp} from '../effects/effect-types.js';
import {
	useMemoizedEffectDefinitions,
	useMemoizedEffects,
} from '../effects/use-memoized-effects.js';
import {addSequenceStackTraces} from '../enable-sequence-stack-traces.js';
import {
	baseSchema,
	borderSchema,
	transformSchema,
	type InteractivitySchema,
} from '../interactivity-schema.js';
import {Sequence} from '../Sequence.js';
import {useCurrentFrame} from '../use-current-frame.js';
import {useDelayRender} from '../use-delay-render.js';
import {useVideoConfig} from '../use-video-config.js';
import {withInteractivitySchema} from '../with-interactivity-schema.js';
import type {AnimatedImageCanvasRef} from './canvas';
import {Canvas} from './canvas';
import type {RemotionImageDecoder} from './decode-image.js';
import {decodeImage} from './decode-image.js';
import {getCurrentTime} from './get-current-time.js';
import type {
	AnimatedImageCanvasProps,
	AnimatedImageProps,
	RemotionAnimatedImageProps,
} from './props';
import {serializeRequestInit} from './request-init';
import {resolveAnimatedImageSource} from './resolve-image-source';

export const animatedImageSchema = {
	src: {
		type: 'asset',
		default: undefined,
		description: 'Source',
		keyframable: false,
	},
	...baseSchema,
	playbackRate: {
		type: 'number',
		min: 0,
		max: 10,
		step: 0.1,
		default: 1,
		description: 'Playback rate',
		hiddenFromList: false,
		keyframable: false,
	},
	...transformSchema,
	...borderSchema,
} as const satisfies InteractivitySchema;

const getCanvasPropsFromSequenceProps = (
	props: Record<string, unknown>,
): AnimatedImageCanvasProps => {
	const canvasProps: AnimatedImageCanvasProps = {};
	const mutableCanvasProps = canvasProps as Record<string, unknown>;

	for (const key in props) {
		if (
			Object.prototype.hasOwnProperty.call(props, key) &&
			(key.startsWith('data-') || key.startsWith('aria-'))
		) {
			mutableCanvasProps[key] = props[key];
		}
	}

	return canvasProps;
};

type AnimatedImageContentProps = RemotionAnimatedImageProps & {
	readonly effects: EffectsProp;
	readonly controls: SequenceControls | undefined;
};

const AnimatedImageContent = forwardRef<
	HTMLCanvasElement,
	AnimatedImageContentProps
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
			requestInit,
			effects,
			controls,
			...props
		},
		canvasRef,
	) => {
		const resolvedSrc = resolveAnimatedImageSource(src);
		const [imageDecoder, setImageDecoder] =
			useState<RemotionImageDecoder | null>(null);
		const {delayRender, continueRender} = useDelayRender();

		const [decodeHandle] = useState(() =>
			delayRender(`Rendering <AnimatedImage/> with src="${resolvedSrc}"`),
		);

		const frame = useCurrentFrame();
		const {fps} = useVideoConfig();
		const currentTime = getCurrentTime({frame, playbackRate, fps});
		const currentTimeRef = useRef<number>(currentTime);
		currentTimeRef.current = currentTime;
		const requestInitKey = serializeRequestInit(requestInit);
		const requestInitRef = useRef(requestInit);
		requestInitRef.current = requestInit;

		const ref = useRef<AnimatedImageCanvasRef>(null);

		const memoizedEffects = useMemoizedEffects({
			effects,
			overrideId: controls?.overrideId ?? null,
		});

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
			let cancelled = false;
			let continued = false;

			const continueRenderOnce = () => {
				if (continued) {
					return;
				}

				continued = true;
				continueRender(decodeHandle);
			};

			decodeImage({
				resolvedSrc,
				signal: controller.signal,
				requestInit: requestInitRef.current,
				currentTime: currentTimeRef.current,
				initialLoopBehavior,
			})
				.then((d) => {
					if (cancelled) {
						d.close();
						return;
					}

					setImageDecoder(d);
					continueRenderOnce();
				})
				.catch((err) => {
					if (cancelled) {
						return;
					}

					if ((err as Error).name === 'AbortError') {
						continueRenderOnce();

						return;
					}

					if (onError) {
						onError?.(err as Error);
						continueRenderOnce();
					} else {
						cancelRender(err);
					}
				});

			return () => {
				cancelled = true;
				controller.abort();
				continueRenderOnce();
			};
		}, [
			resolvedSrc,
			decodeHandle,
			onError,
			requestInitKey,
			initialLoopBehavior,
			continueRender,
		]);

		useEffect(() => {
			return () => {
				imageDecoder?.close();
			};
		}, [imageDecoder]);

		useLayoutEffect(() => {
			if (!imageDecoder) {
				return;
			}

			const delay = delayRender(
				`Rendering frame at ${currentTime} of <AnimatedImage src="${src}"/>`,
			);

			let cancelled = false;

			imageDecoder
				.getFrame(currentTime, loopBehavior)
				.then(async (videoFrame) => {
					if (cancelled) {
						return;
					}

					if (videoFrame === null) {
						ref.current?.clear();
						continueRender(delay);
						return;
					}

					const completed = await ref.current?.draw(videoFrame.frame!);
					if (completed && !cancelled) {
						continueRender(delay);
					}
				})
				.catch((err) => {
					if (cancelled) {
						return;
					}

					if (onError) {
						onError(err as Error);
						continueRender(delay);
					} else {
						cancelRender(err);
					}
				});

			return () => {
				cancelled = true;
				continueRender(delay);
			};
		}, [
			currentTime,
			imageDecoder,
			loopBehavior,
			onError,
			src,
			continueRender,
			delayRender,
			memoizedEffects,
			fit,
			width,
			height,
		]);

		return (
			<Canvas
				ref={ref}
				width={width}
				height={height}
				fit={fit}
				effects={memoizedEffects}
				{...props}
			/>
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
	requestInit,
	effects = [],
	controls,
	ref,
	...sequenceProps
}: AnimatedImageProps & {
	readonly controls?: SequenceControls | undefined;
	readonly ref?: React.Ref<HTMLCanvasElement>;
}) => {
	const actualRef = useRef<HTMLCanvasElement | null>(null);

	const memoizedEffectDefinitions = useMemoizedEffectDefinitions(effects);

	useImperativeHandle(ref, () => {
		return actualRef.current as HTMLCanvasElement;
	}, []);

	const canvasProps = getCanvasPropsFromSequenceProps(sequenceProps);

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
		requestInit,
		...canvasProps,
	};

	return (
		<Sequence
			layout="none"
			durationInFrames={durationInFrames}
			name="<AnimatedImage>"
			_remotionInternalDocumentationLink="https://www.remotion.dev/docs/animatedimage"
			controls={controls}
			_remotionInternalEffects={memoizedEffectDefinitions}
			{...sequenceProps}
			outlineRef={actualRef}
		>
			<AnimatedImageContent
				{...animatedImageProps}
				ref={actualRef}
				effects={effects}
				controls={controls}
			/>
		</Sequence>
	);
};

export const AnimatedImage = withInteractivitySchema({
	Component: AnimatedImageInner,
	componentName: '<AnimatedImage>',
	componentIdentity: 'dev.remotion.remotion.AnimatedImage',
	schema: animatedImageSchema,
	supportsEffects: true,
});

AnimatedImage.displayName = 'AnimatedImage';

addSequenceStackTraces(AnimatedImage);
