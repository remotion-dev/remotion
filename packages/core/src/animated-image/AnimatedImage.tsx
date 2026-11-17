import type React from 'react';
import {
	forwardRef,
	useContext,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {SequenceControls} from '../CompositionManager.js';
import type {EffectsProp, EffectsOutputSize} from '../effects/effect-types.js';
import {
	useMemoizedEffectDefinitions,
	useMemoizedEffects,
} from '../effects/use-memoized-effects.js';
import {
	addSequenceStackTraces,
	getStackForControls,
} from '../enable-sequence-stack-traces.js';
import {Freeze} from '../freeze.js';
import {getCanvasPropsFromSequenceProps} from '../get-canvas-props-from-sequence-props.js';
import {
	backgroundSchema,
	baseSchema,
	borderRadiusSchema,
	borderSchema,
	cropSchema,
	loopField,
	transformSchema,
	type InteractivitySchema,
} from '../interactivity-schema.js';
import {resolveSequenceDuration} from '../resolve-sequence-duration.js';
import {SequenceContent} from '../sequence-activity-context.js';
import {Sequence} from '../Sequence.js';
import {SequenceContext} from '../SequenceContext.js';
import {useCropStyle} from '../use-crop-style.js';
import {useCurrentFrame} from '../use-current-frame.js';
import {useDelayRender} from '../use-delay-render.js';
import {useVideoEnabled} from '../use-media-enabled.js';
import {useMotionBlurCanvas} from '../use-motion-blur-canvas.js';
import {usePremounting} from '../use-premounting.js';
import {useVideoConfig} from '../use-video-config.js';
import {withInteractivitySchema} from '../with-interactivity-schema.js';
import type {AnimatedImageCanvasRef} from './canvas';
import {Canvas} from './canvas';
import type {RemotionImageDecoder} from './decode-image.js';
import {decodeImage} from './decode-image.js';
import {getCurrentTime} from './get-current-time.js';
import {getAnimatedImageDurationInSeconds} from './get-duration-in-seconds.js';
import type {AnimatedImageProps, RemotionAnimatedImageProps} from './props';
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
	...transformSchema,
	...backgroundSchema,
	...borderSchema,
	...borderRadiusSchema,
} as const satisfies InteractivitySchema;

type AnimatedImageContentProps = RemotionAnimatedImageProps & {
	readonly effects: EffectsProp;
	readonly effectsOutputSize: EffectsOutputSize | null;
	readonly controls: SequenceControls | undefined;
	readonly onCanvasUpdated: ((canvas: HTMLCanvasElement) => void) | null;
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
			onCanvasUpdated,
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
		const activeDecoderRef = useRef<RemotionImageDecoder | null>(null);
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
			runtimeValues: controls?.runtimeValues ?? null,
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
			let decoder: RemotionImageDecoder | null = null;

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

					decoder = d;
					activeDecoderRef.current = d;
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
				activeDecoderRef.current = null;
				decoder?.close();
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
		]);

		useLayoutEffect(() => {
			// Activity and Suspense can retain state after cleaning up effects.
			// Wait for the current loading effect to publish a live decoder.
			if (
				!imageDecoder ||
				!decodedImage ||
				activeDecoderRef.current !== imageDecoder
			) {
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
				onCanvasUpdated={onCanvasUpdated}
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
	motionBlur,
	ref,
	...sequenceProps
}: AnimatedImageProps & {
	readonly controls?: SequenceControls | undefined;
	readonly ref?: React.Ref<HTMLCanvasElement>;
	readonly motionBlur: ReturnType<typeof useMotionBlurCanvas>;
}) => {
	const isMedia = useMemo(
		() => ({
			type: 'image' as const,
			src: resolveAnimatedImageSource(src),
			animated: {
				loopBehavior: loopBehavior ?? 'loop',
				requestInit: requestInit ?? null,
			},
		}),
		[src, loopBehavior, requestInit],
	);

	const memoizedEffectDefinitions = useMemoizedEffectDefinitions(effects);

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
				_remotionInternalIsMedia={isMedia}
				{...sequenceProps}
			>
				{/* Hidden Activity cleans up effects but retains state. Unmount the
				decoder so reactivation cannot reuse one that cleanup has closed. */}
				<SequenceContent>
					{motionBlur.primary ? (
						<AnimatedImageContent
							{...animatedImageProps}
							ref={ref}
							effects={effects}
							effectsOutputSize={effectsOutputSize ?? null}
							controls={controls}
							onCanvasUpdated={motionBlur.onCanvasUpdated}
						/>
					) : (
						<canvas
							{...canvasProps}
							ref={ref}
							id={id}
							className={className}
							width={width}
							height={height}
							style={{width, height, ...croppedStyle}}
						/>
					)}
				</SequenceContent>
			</Sequence>
		</Freeze>
	);
};

const AnimatedImageWithIntrinsicDuration = (
	props: AnimatedImageProps & {
		readonly controls?: SequenceControls | undefined;
		readonly ref?: React.Ref<HTMLCanvasElement>;
		readonly motionBlur: ReturnType<typeof useMotionBlurCanvas>;
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
	const videoEnabled = useVideoEnabled();
	const parentSequence = useContext(SequenceContext);
	const sourceStack = props.controls
		? getStackForControls(props.controls)
		: null;
	const sourceKey = useMemo(
		() =>
			JSON.stringify([
				'animated-image',
				resolveAnimatedImageSource(props.src),
				serializeRequestInit(props.requestInit),
				sourceStack,
				parentSequence?.absoluteFrom,
				parentSequence?.playbackRate,
				props.from,
				props.trimBefore,
				props.durationInFrames,
				props.playbackRate,
				props.loop,
				props.loopBehavior,
				props.freeze,
			]),
		[
			sourceStack,
			parentSequence?.absoluteFrom,
			parentSequence?.playbackRate,
			props.src,
			props.requestInit,
			props.from,
			props.trimBefore,
			props.durationInFrames,
			props.playbackRate,
			props.loop,
			props.loopBehavior,
			props.freeze,
		],
	);
	const motionBlur = useMotionBlurCanvas({
		sourceKey,
		contentKey: JSON.stringify([
			resolveAnimatedImageSource(props.src),
			serializeRequestInit(props.requestInit),
		]),
		forwardedRef: props.ref ?? null,
		onVideoFrame: null,
	});
	if (videoEnabled === false) {
		return null;
	}

	if (!motionBlur.primary) {
		return (
			<AnimatedImageInner
				{...props}
				ref={motionBlur.canvasRef}
				motionBlur={motionBlur}
				loop={false}
				durationInFrames={props.loop ? undefined : props.durationInFrames}
			/>
		);
	}

	if (props.loop && props.durationInFrames === undefined) {
		const resolvedSrc = resolveAnimatedImageSource(props.src);
		const requestInitKey = serializeRequestInit(props.requestInit);
		return (
			<AnimatedImageWithIntrinsicDuration
				{...props}
				key={`${resolvedSrc}-${requestInitKey}-${props.trimBefore ?? 0}`}
				ref={motionBlur.canvasRef}
				motionBlur={motionBlur}
			/>
		);
	}

	return (
		<AnimatedImageInner
			{...props}
			ref={motionBlur.canvasRef}
			motionBlur={motionBlur}
		/>
	);
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
