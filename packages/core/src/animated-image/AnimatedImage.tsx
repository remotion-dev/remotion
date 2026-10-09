import type React from 'react';
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import type {SequenceControls} from '../CompositionManager.js';
import type {EffectsProp, EffectsOutputSize} from '../effects/effect-types.js';
import {
	useMemoizedEffectDefinitions,
	useMemoizedEffects,
} from '../effects/use-memoized-effects.js';
import {addSequenceStackTraces} from '../enable-sequence-stack-traces.js';
import {Freeze} from '../freeze.js';
import {
	backgroundSchema,
	baseSchema,
	borderRadiusSchema,
	borderSchema,
	cropSchema,
	loopField,
	premountSchema,
	transformSchema,
	type InteractivitySchema,
} from '../interactivity-schema.js';
import {resolveSequenceDuration} from '../resolve-sequence-duration.js';
import {SequenceContent} from '../sequence-activity-context.js';
import {Sequence} from '../Sequence.js';
import {useCropStyle} from '../use-crop-style.js';
import {useCurrentFrame} from '../use-current-frame.js';
import {useDelayRender} from '../use-delay-render.js';
import {usePremounting} from '../use-premounting.js';
import {useVideoConfig} from '../use-video-config.js';
import {withInteractivitySchema} from '../with-interactivity-schema.js';
import type {AnimatedImageCanvasRef} from './canvas';
import {Canvas} from './canvas';
import type {RemotionImageDecoder} from './decode-image.js';
import {decodeImage} from './decode-image.js';
import {getCurrentTime} from './get-current-time.js';
import {getAnimatedImageDurationInSeconds} from './get-duration-in-seconds.js';
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
		assetType: 'image',
		default: undefined,
		description: 'Source',
		keyframable: false,
	},
	...baseSchema,
	loop: loopField,
	...cropSchema,
	...premountSchema,
	...transformSchema,
	...backgroundSchema,
	...borderSchema,
	...borderRadiusSchema,
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
	readonly effectsOutputSize: EffectsOutputSize | null;
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
			effectsOutputSize,
			controls,
			...props
		},
		canvasRef,
	) => {
		const resolvedSrc = resolveAnimatedImageSource(src);
		const [decodedImage, setDecodedImage] = useState<{
			decoder: RemotionImageDecoder;
			handle: number;
		} | null>(null);
		const imageDecoder = decodedImage?.decoder ?? null;
		const {delayRender, continueRender, cancelRender} = useDelayRender();

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
			videoConfigValues: controls?.videoConfigValues ?? null,
		});

		useImperativeHandle(canvasRef, () => {
			const c = ref.current?.getCanvas();
			if (!c) {
				throw new Error('Canvas ref is not set');
			}

			return c;
		}, []);

		const [initialLoopBehavior] = useState(() => loopBehavior);

		useLayoutEffect(() => {
			const decodeHandle = delayRender(
				`Rendering <AnimatedImage/> with src="${resolvedSrc}"`,
			);
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

					setDecodedImage({decoder: d, handle: decodeHandle});
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
			onError,
			requestInitKey,
			initialLoopBehavior,
			continueRender,
			delayRender,
			cancelRender,
			effectsOutputSize?.width,
			effectsOutputSize?.height,
		]);

		useEffect(() => {
			return () => {
				imageDecoder?.close();
			};
		}, [imageDecoder]);

		useLayoutEffect(() => {
			if (!imageDecoder || !decodedImage) {
				return;
			}

			const delay = delayRender(
				`Rendering frame at ${currentTime} of <AnimatedImage src="${src}"/>`,
			);
			// The frame hold takes over only after the decoded image has committed.
			continueRender(decodedImage.handle);

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
			decodedImage,
			loopBehavior,
			onError,
			src,
			continueRender,
			delayRender,
			memoizedEffects,
			fit,
			width,
			height,
			cancelRender,
			effectsOutputSize?.width,
			effectsOutputSize?.height,
		]);

		return (
			<Canvas
				ref={ref}
				width={width}
				height={height}
				fit={fit}
				effects={memoizedEffects}
				effectsOutputSize={effectsOutputSize ?? null}
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
	from,
	premountFor,
	postmountFor,
	styleWhilePremounted,
	styleWhilePostmounted,
	cropLeft,
	cropRight,
	cropTop,
	cropBottom,
	requestInit,
	effects = [],
	effectsOutputSize,
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
	const {
		effectivePostmountFor,
		effectivePremountFor,
		freezeFrame,
		isPremountingOrPostmounting,
		postmountingActive,
		premountingActive,
		premountingStyle,
	} = usePremounting({
		from: from ?? 0,
		durationInFrames: resolveSequenceDuration({
			durationInFrames,
			playbackRate,
			loop: sequenceProps.loop,
		}),
		premountFor: premountFor ?? null,
		postmountFor: postmountFor ?? null,
		style: style ?? null,
		styleWhilePremounted: styleWhilePremounted ?? null,
		styleWhilePostmounted: styleWhilePostmounted ?? null,
		hideWhilePremounted: 'display-none',
	});
	const croppedStyle = useCropStyle({
		cropLeft,
		cropRight,
		cropTop,
		cropBottom,
		style: premountingStyle,
		componentName: '<AnimatedImage />',
	});

	const canvasProps = getCanvasPropsFromSequenceProps(sequenceProps);

	const animatedImageProps: RemotionAnimatedImageProps = {
		src,
		width,
		height,
		onError,
		fit,
		loopBehavior,
		id,
		className,
		style: croppedStyle ?? undefined,
		requestInit,
		...canvasProps,
	};

	return (
		<Freeze
			frame={freezeFrame}
			active={isPremountingOrPostmounting}
			_remotionInternalIsPremounting={premountingActive}
		>
			<Sequence
				layout="none"
				from={from ?? 0}
				playbackRate={playbackRate}
				durationInFrames={durationInFrames}
				name="<AnimatedImage>"
				_remotionInternalDocumentationLink="https://www.remotion.dev/docs/animatedimage"
				controls={controls}
				_remotionInternalEffects={memoizedEffectDefinitions}
				_remotionInternalPremountDisplay={effectivePremountFor || null}
				_remotionInternalPostmountDisplay={effectivePostmountFor || null}
				_remotionInternalIsPremounting={premountingActive}
				_remotionInternalIsPostmounting={postmountingActive}
				{...sequenceProps}
			>
				{/* Hidden Activity cleans up effects but retains state. Unmount the
				decoder so reactivation cannot reuse one that cleanup has closed. */}
				<SequenceContent>
					<AnimatedImageContent
						{...animatedImageProps}
						ref={actualRef}
						effects={effects}
						effectsOutputSize={effectsOutputSize ?? null}
						controls={controls}
					/>
				</SequenceContent>
			</Sequence>
		</Freeze>
	);
};

const AnimatedImageWithIntrinsicDuration = (
	props: AnimatedImageProps & {
		readonly controls?: SequenceControls | undefined;
		readonly ref?: React.Ref<HTMLCanvasElement>;
	},
) => {
	const {fps} = useVideoConfig();
	const {delayRender, continueRender, cancelRender} = useDelayRender();
	const {src, requestInit, trimBefore} = props;
	const requestInitRef = useRef(requestInit);
	requestInitRef.current = requestInit;
	const onErrorRef = useRef(props.onError);
	onErrorRef.current = props.onError;
	const [duration, setDuration] = useState<{
		durationInFrames: number;
		handle: number;
	} | null>(null);
	const [failedHandle, setFailedHandle] = useState<number | null>(null);

	useLayoutEffect(() => {
		const handle = delayRender(
			`Finding duration of <AnimatedImage src="${src}" />`,
		);
		const controller = new AbortController();
		let cancelled = false;
		getAnimatedImageDurationInSeconds({
			resolvedSrc: resolveAnimatedImageSource(src),
			signal: controller.signal,
			requestInit: requestInitRef.current,
			contentType: null,
		})
			.then((durationInSeconds) => {
				if (!cancelled) {
					setDuration({
						durationInFrames:
							Math.ceil(durationInSeconds * fps) - (trimBefore ?? 0),
						handle,
					});
				}
			})
			.catch((error) => {
				if (cancelled) {
					return;
				}

				if (onErrorRef.current) {
					onErrorRef.current(error);
					setFailedHandle(handle);
				} else {
					cancelRender(error);
				}
			});

		return () => {
			cancelled = true;
			controller.abort();
			continueRender(handle);
		};
	}, [cancelRender, continueRender, delayRender, fps, src, trimBefore]);

	useLayoutEffect(() => {
		if (duration !== null) {
			continueRender(duration.handle);
		}

		if (failedHandle !== null) {
			continueRender(failedHandle);
		}
	}, [continueRender, duration, failedHandle]);

	if (duration === null || failedHandle !== null) {
		return null;
	}

	return (
		<AnimatedImageInner
			{...props}
			durationInFrames={duration.durationInFrames}
		/>
	);
};

const AnimatedImageComponent = (
	props: AnimatedImageProps & {
		readonly controls?: SequenceControls | undefined;
		readonly ref?: React.Ref<HTMLCanvasElement>;
	},
) => {
	if (props.loop && props.durationInFrames === undefined) {
		const resolvedSrc = resolveAnimatedImageSource(props.src);
		const requestInitKey = serializeRequestInit(props.requestInit);
		return (
			<AnimatedImageWithIntrinsicDuration
				{...props}
				key={`${resolvedSrc}-${requestInitKey}-${props.trimBefore ?? 0}`}
			/>
		);
	}

	return <AnimatedImageInner {...props} />;
};

export const AnimatedImage = withInteractivitySchema({
	Component: AnimatedImageComponent,
	componentName: '<AnimatedImage>',
	componentIdentity: 'dev.remotion.remotion.AnimatedImage',
	schema: animatedImageSchema,
	supportsEffects: true,
});

AnimatedImage.displayName = 'AnimatedImage';

addSequenceStackTraces(AnimatedImage);
