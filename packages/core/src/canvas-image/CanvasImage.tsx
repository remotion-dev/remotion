import {
	forwardRef,
	useCallback,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
	type RefObject,
} from 'react';
import {calculateImageFit} from '../calculate-image-fit.js';
import type {SequenceControls} from '../CompositionManager.js';
import type {EffectsProp} from '../effects/effect-types.js';
import {runEffectChain} from '../effects/run-effect-chain.js';
import {useEffectChainState} from '../effects/use-effect-chain-state.js';
import {
	useMemoizedEffectDefinitions,
	useMemoizedEffects,
} from '../effects/use-memoized-effects.js';
import {addSequenceStackTraces} from '../enable-sequence-stack-traces.js';
import {
	freezeField,
	fromField,
	hiddenField,
	sequenceVisualStyleSchema,
	durationInFramesField,
	type InteractivitySchema,
} from '../interactivity-schema.js';
import {usePreload} from '../prefetch.js';
import {Sequence} from '../Sequence.js';
import {SequenceContext} from '../SequenceContext.js';
import {truncateSrcForLabel} from '../truncate-src-for-label.js';
import {useBufferState} from '../use-buffer-state.js';
import {useDelayRender} from '../use-delay-render.js';
import {withInteractivitySchema} from '../with-interactivity-schema.js';
import type {CanvasImageCanvasProps, CanvasImageProps} from './props.js';

export const canvasImageSchema = {
	durationInFrames: durationInFramesField,
	from: fromField,
	freeze: freezeField,
	fit: {
		type: 'enum',
		default: 'fill',
		description: 'Fit',
		variants: {
			fill: {},
			contain: {},
			cover: {},
		},
	},
	...sequenceVisualStyleSchema,
	hidden: hiddenField,
} as const satisfies InteractivitySchema;

type LoadedImage = {
	readonly element: HTMLImageElement;
	readonly width: number;
	readonly height: number;
};

const makeAbortError = () => {
	if (typeof DOMException !== 'undefined') {
		return new DOMException('Image loading was aborted', 'AbortError');
	}

	const error = new Error('Image loading was aborted');
	error.name = 'AbortError';
	return error;
};

const loadImage = ({
	src,
	signal,
}: {
	readonly src: string;
	readonly signal: AbortSignal;
}): Promise<LoadedImage> => {
	return new Promise((resolve, reject) => {
		const image = new Image();
		let settled = false;

		function cleanup() {
			image.onload = null;
			image.onerror = null;
		}

		function settle(callback: () => void) {
			if (settled) {
				return;
			}

			settled = true;
			cleanup();
			callback();
		}

		function onAbort() {
			settle(() => reject(makeAbortError()));
		}

		image.onload = () => {
			Promise.resolve(image.decode?.())
				.catch(() => undefined)
				.then(() => {
					const imageWidth = image.naturalWidth || image.width;
					const imageHeight = image.naturalHeight || image.height;
					if (imageWidth <= 0 || imageHeight <= 0) {
						settle(() =>
							reject(
								new Error(
									`Could not determine dimensions for <CanvasImage> with src="${truncateSrcForLabel(
										src,
									)}"`,
								),
							),
						);
						return;
					}

					settle(() =>
						resolve({element: image, width: imageWidth, height: imageHeight}),
					);
				});
		};

		image.onerror = () => {
			settle(() =>
				reject(
					new Error(
						`Could not load <CanvasImage> with src="${truncateSrcForLabel(src)}"`,
					),
				),
			);
		};

		signal.addEventListener('abort', onAbort, {once: true});
		if (signal.aborted) {
			onAbort();
			return;
		}

		image.crossOrigin = 'anonymous';
		image.src = src;
	});
};

function exponentialBackoff(errorCount: number): number {
	return 1000 * 2 ** (errorCount - 1);
}

type CanvasImageContentProps = Pick<
	CanvasImageProps,
	| 'className'
	| 'delayRenderRetries'
	| 'delayRenderTimeoutInMilliseconds'
	| 'fit'
	| 'height'
	| 'id'
	| 'maxRetries'
	| 'onError'
	| 'pauseWhenLoading'
	| 'src'
	| 'style'
	| 'width'
> & {
	readonly effects: EffectsProp;
	readonly controls: SequenceControls | undefined;
	readonly refForOutline: RefObject<HTMLElement | null> | null;
} & CanvasImageCanvasProps;

const CanvasImageContent = forwardRef<
	HTMLCanvasElement,
	CanvasImageContentProps
>(
	(
		{
			src,
			width,
			height,
			fit = 'fill',
			effects,
			controls,
			onError,
			className,
			style,
			id,
			pauseWhenLoading,
			maxRetries = 2,
			delayRenderRetries,
			delayRenderTimeoutInMilliseconds,
			refForOutline,
			...canvasProps
		},
		ref,
	) => {
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const {delayPlayback} = useBufferState();
		const [outputCanvas, setOutputCanvas] = useState<HTMLCanvasElement | null>(
			null,
		);
		const actualSrc = usePreload(src);
		const chainState = useEffectChainState();
		const memoizedEffects = useMemoizedEffects({
			effects,
			overrideId: controls?.overrideId ?? null,
		});
		const sequenceContext = useContext(SequenceContext);

		const sourceCanvas = useMemo(() => {
			if (typeof document === 'undefined') {
				return null;
			}

			return document.createElement('canvas');
		}, []);

		const canvasRef = useCallback(
			(canvas: HTMLCanvasElement | null) => {
				setOutputCanvas(canvas);
				if (refForOutline) {
					refForOutline.current = canvas;
				}

				if (typeof ref === 'function') {
					ref(canvas);
				} else if (ref) {
					ref.current = canvas;
				}
			},
			[ref, refForOutline],
		);

		useEffect(() => {
			if (!outputCanvas || !sourceCanvas) {
				return;
			}

			const isPremounting = Boolean(sequenceContext?.premounting);
			const isPostmounting = Boolean(sequenceContext?.postmounting);

			const handle = delayRender(
				`Rendering <CanvasImage> with src="${truncateSrcForLabel(actualSrc)}"`,
				{
					retries: delayRenderRetries ?? undefined,
					timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
				},
			);
			const unblock =
				pauseWhenLoading && !isPremounting && !isPostmounting
					? delayPlayback().unblock
					: () => undefined;

			const controller = new AbortController();
			let cancelled = false;
			let continued = false;
			let errorCount = 0;
			let timeoutId: ReturnType<typeof setTimeout> | null = null;

			const continueRenderOnce = () => {
				if (continued) {
					return;
				}

				continued = true;
				unblock();
				continueRender(handle);
			};

			const attemptLoad = () => {
				loadImage({src: actualSrc, signal: controller.signal})
					.then((image) => {
						if (cancelled) {
							return;
						}

						const canvasWidth = width ?? image.width;
						const canvasHeight = height ?? image.height;
						const sourceContext = sourceCanvas.getContext('2d', {
							colorSpace: 'srgb',
						});

						if (!sourceContext) {
							throw new Error(
								'Could not get 2D context for <CanvasImage> source canvas',
							);
						}

						sourceCanvas.width = canvasWidth;
						sourceCanvas.height = canvasHeight;
						outputCanvas.width = canvasWidth;
						outputCanvas.height = canvasHeight;

						sourceContext.clearRect(0, 0, canvasWidth, canvasHeight);
						sourceContext.drawImage(
							image.element,
							...calculateImageFit(
								fit,
								{width: image.width, height: image.height},
								{width: canvasWidth, height: canvasHeight},
							),
						);

						return runEffectChain({
							state: chainState.get(canvasWidth, canvasHeight)!,
							source: sourceCanvas,
							effects: memoizedEffects,
							output: outputCanvas,
							width: canvasWidth,
							height: canvasHeight,
						});
					})
					.then((completed) => {
						if (completed && !cancelled) {
							continueRenderOnce();
						}
					})
					.catch((err) => {
						if ((err as Error).name === 'AbortError') {
							continueRenderOnce();
							return;
						}

						errorCount++;
						if (errorCount <= maxRetries) {
							const backoff = exponentialBackoff(errorCount);
							// eslint-disable-next-line no-console
							console.warn(
								`Could not load <CanvasImage> with src="${truncateSrcForLabel(actualSrc)}", retrying in ${backoff}ms`,
							);
							timeoutId = setTimeout(() => {
								if (!cancelled) {
									attemptLoad();
								}
							}, backoff);
						} else if (onError) {
							onError(err as Error);
							continueRenderOnce();
						} else {
							cancelRender(err);
						}
					});
			};

			attemptLoad();

			return () => {
				cancelled = true;
				if (timeoutId !== null) {
					clearTimeout(timeoutId);
				}

				controller.abort();
				continueRenderOnce();
			};
		}, [
			actualSrc,
			cancelRender,
			chainState,
			continueRender,
			delayPlayback,
			delayRender,
			delayRenderRetries,
			delayRenderTimeoutInMilliseconds,
			fit,
			height,
			maxRetries,
			memoizedEffects,
			onError,
			outputCanvas,
			pauseWhenLoading,
			sequenceContext?.postmounting,
			sequenceContext?.premounting,
			sourceCanvas,
			width,
		]);

		return (
			<canvas
				{...canvasProps}
				ref={canvasRef}
				width={width}
				height={height}
				className={className}
				style={style}
				id={id}
			/>
		);
	},
);

CanvasImageContent.displayName = 'CanvasImageContent';

const CanvasImageInner = forwardRef<
	HTMLCanvasElement,
	CanvasImageProps & {
		readonly controls: SequenceControls | undefined;
	}
>(
	(
		{
			src,
			width,
			height,
			fit,
			effects = [],
			className,
			style,
			id,
			onError,
			pauseWhenLoading,
			maxRetries,
			delayRenderRetries,
			delayRenderTimeoutInMilliseconds,
			durationInFrames,
			from,
			freeze,
			hidden,
			name,
			showInTimeline,
			stack,
			controls,
			_remotionInternalDocumentationLink,
			_remotionInternalRefForOutline,
			...canvasProps
		},
		ref,
	) => {
		if (!src) {
			throw new Error('No "src" prop was passed to <CanvasImage>.');
		}

		const memoizedEffectDefinitions = useMemoizedEffectDefinitions(effects);
		const actualRef = useRef<HTMLCanvasElement | null>(null);
		useImperativeHandle(ref, () => {
			return actualRef.current as HTMLCanvasElement;
		}, []);

		return (
			<Sequence
				layout="none"
				from={from ?? 0}
				durationInFrames={durationInFrames ?? Infinity}
				freeze={freeze}
				hidden={hidden}
				showInTimeline={showInTimeline ?? true}
				name={name ?? '<CanvasImage>'}
				_remotionInternalDocumentationLink={
					_remotionInternalDocumentationLink ??
					'https://www.remotion.dev/docs/canvasimage'
				}
				controls={controls}
				_remotionInternalEffects={memoizedEffectDefinitions}
				_remotionInternalIsMedia={{type: 'image', src}}
				_remotionInternalStack={stack}
				_remotionInternalRefForOutline={
					_remotionInternalRefForOutline ?? actualRef
				}
			>
				<CanvasImageContent
					ref={actualRef}
					src={src}
					width={width}
					height={height}
					fit={fit}
					effects={effects}
					controls={controls}
					className={className}
					style={style}
					id={id}
					onError={onError}
					pauseWhenLoading={pauseWhenLoading}
					maxRetries={maxRetries}
					delayRenderRetries={delayRenderRetries}
					delayRenderTimeoutInMilliseconds={delayRenderTimeoutInMilliseconds}
					refForOutline={_remotionInternalRefForOutline ?? null}
					{...canvasProps}
				/>
			</Sequence>
		);
	},
);

/*
 * @description Renders a static image to a `<canvas>` and applies Remotion effects.
 * @see [Documentation](https://www.remotion.dev/docs/canvasimage)
 */
export const CanvasImage = withInteractivitySchema({
	Component: CanvasImageInner,
	componentIdentity: 'dev.remotion.remotion.CanvasImage',
	schema: canvasImageSchema,
	supportsEffects: true,
});

CanvasImage.displayName = 'CanvasImage';

addSequenceStackTraces(CanvasImage);
