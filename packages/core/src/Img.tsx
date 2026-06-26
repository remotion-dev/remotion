import React, {useCallback, useContext, useLayoutEffect, useRef} from 'react';
import type {IsExact} from './audio/props.js';
import type {ImageFit} from './calculate-image-fit.js';
import {CanvasImage} from './canvas-image/index.js';
import type {
	CanvasImageCanvasProps,
	CanvasImageProps,
} from './canvas-image/props.js';
import type {SequenceControls} from './CompositionManager.js';
import type {EffectsProp} from './effects/effect-types.js';
import {addSequenceStackTraces} from './enable-sequence-stack-traces.js';
import {getCrossOriginValue} from './get-cross-origin-value.js';
import type {InteractiveBaseProps} from './Interactive.js';
import {
	baseSchema,
	transformSchema,
	type InteractivitySchema,
} from './interactivity-schema.js';
import {usePreload} from './prefetch.js';
import {Sequence} from './Sequence.js';
import {SequenceContext} from './SequenceContext.js';
import {truncateSrcForLabel} from './truncate-src-for-label.js';
import {useBufferState} from './use-buffer-state.js';
import {useDelayRender} from './use-delay-render.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
import {withInteractivitySchema} from './with-interactivity-schema.js';

function exponentialBackoff(errorCount: number): number {
	return 1000 * 2 ** (errorCount - 1);
}

type NativeImgProps = Omit<
	React.DetailedHTMLProps<
		React.ImgHTMLAttributes<HTMLImageElement>,
		HTMLImageElement
	>,
	'src'
>;

export type ImgProps = NativeImgProps & {
	readonly maxRetries?: number;
	readonly pauseWhenLoading?: boolean;
	readonly delayRenderRetries?: number;
	readonly delayRenderTimeoutInMilliseconds?: number;
	readonly onImageFrame?: (imageElement: HTMLImageElement) => void;
	readonly src: string;
	readonly effects?: EffectsProp;
	readonly showInTimeline?: boolean;
	readonly name?: string;
	/**
	 * @deprecated For internal use only
	 */
	readonly stack?: string;
} & InteractiveBaseProps;

type Expected = Omit<
	NativeImgProps,
	'onError' | 'src' | 'crossOrigin' | 'ref' | 'hidden'
>;

type ImgContentProps = Omit<
	ImgProps,
	| 'hidden'
	| 'name'
	| 'stack'
	| 'showInTimeline'
	| 'from'
	| 'trimBefore'
	| 'durationInFrames'
	| 'freeze'
	| 'effects'
> & {
	readonly refForOutline: React.RefObject<HTMLElement | null>;
};

const ImgContent: React.FC<ImgContentProps> = ({
	onError,
	maxRetries = 2,
	src,
	pauseWhenLoading,
	delayRenderRetries,
	delayRenderTimeoutInMilliseconds,
	onImageFrame,
	crossOrigin,
	decoding,
	ref,
	refForOutline,
	...props
}) => {
	const imageRef = useRef<HTMLImageElement>(null);
	const errors = useRef<Record<string, number>>({});
	const {delayPlayback} = useBufferState();
	const sequenceContext = useContext(SequenceContext);

	const _propsValid: IsExact<typeof props, Omit<Expected, 'decoding'>> = true;

	if (!_propsValid) {
		throw new Error('typecheck error');
	}

	const imageCallbackRef = useCallback(
		(img: HTMLImageElement | null) => {
			imageRef.current = img;
			refForOutline.current = img;

			if (typeof ref === 'function') {
				ref(img);
			} else if (ref) {
				ref.current = img;
			}
		},
		[ref, refForOutline],
	);

	const actualSrc = usePreload(src as string);

	const retryIn = useCallback((timeout: number) => {
		if (!imageRef.current) {
			return;
		}

		const currentSrc = imageRef.current.src;

		setTimeout(() => {
			if (!imageRef.current) {
				// Component has been unmounted, do not retry
				return;
			}

			const newSrc = imageRef.current?.src;
			if (newSrc !== currentSrc) {
				// src has changed, do not retry
				return;
			}

			imageRef.current.removeAttribute('src');
			imageRef.current.setAttribute('src', newSrc);
		}, timeout);
	}, []);

	const {delayRender, continueRender, cancelRender} = useDelayRender();

	const didGetError = useCallback(
		(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
			if (!errors.current) {
				return;
			}

			errors.current[imageRef.current?.src as string] =
				(errors.current[imageRef.current?.src as string] ?? 0) + 1;
			if (
				onError &&
				(errors.current[imageRef.current?.src as string] ?? 0) > maxRetries
			) {
				onError(e);
				return;
			}

			if (
				(errors.current[imageRef.current?.src as string] ?? 0) <= maxRetries
			) {
				const backoff = exponentialBackoff(
					errors.current[imageRef.current?.src as string] ?? 0,
				);
				// eslint-disable-next-line no-console
				console.warn(
					`Could not load image with source ${truncateSrcForLabel(
						imageRef.current?.src as string,
					)}, retrying again in ${backoff}ms`,
				);

				retryIn(backoff);
				return;
			}

			try {
				cancelRender(
					'Error loading image with src: ' +
						truncateSrcForLabel(imageRef.current?.src as string),
				);
			} catch {
				// cancelRender() intentionally throws after storing the error in scope.
				// In async image callbacks, we rely on the stored error for renderer propagation.
			}
		},
		[cancelRender, maxRetries, onError, retryIn],
	);

	if (typeof window !== 'undefined') {
		const isPremounting = Boolean(sequenceContext?.premounting);
		const isPostmounting = Boolean(sequenceContext?.postmounting);
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useLayoutEffect(() => {
			if (window.process?.env?.NODE_ENV === 'test') {
				if (imageRef.current) {
					imageRef.current.src = actualSrc;
				}

				return;
			}

			const {current} = imageRef;
			if (!current) {
				return;
			}

			const newHandle = delayRender(
				'Loading <Img> with src=' + truncateSrcForLabel(actualSrc),
				{
					retries: delayRenderRetries ?? undefined,
					timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
				},
			);
			const unblock =
				pauseWhenLoading && !isPremounting && !isPostmounting
					? delayPlayback().unblock
					: () => undefined;

			let unmounted = false;

			const onComplete = () => {
				// the decode() promise isn't cancelable -- it may still resolve after unmounting
				if (unmounted) {
					continueRender(newHandle);
					return;
				}

				if ((errors.current[imageRef.current?.src as string] ?? 0) > 0) {
					delete errors.current[imageRef.current?.src as string];
					// eslint-disable-next-line no-console
					console.info(
						`Retry successful - ${truncateSrcForLabel(
							imageRef.current?.src as string,
						)} is now loaded`,
					);
				}

				if (current) {
					onImageFrame?.(current);
				}

				unblock();
				continueRender(newHandle);
			};

			if (!imageRef.current) {
				onComplete();
				return;
			}

			current.src = actualSrc;
			current
				.decode()
				.then(onComplete)
				.catch((err) => {
					// fall back to onload event if decode() fails
					// eslint-disable-next-line no-console
					console.warn(err);

					// HTMLImageElement.complete is also true for broken images (e.g. 404),
					// so only treat it as loaded if intrinsic dimensions are available.
					if (
						current.complete &&
						current.naturalWidth > 0 &&
						current.naturalHeight > 0
					) {
						onComplete();
					} else {
						current.addEventListener('load', onComplete);
					}
				});

			// If tag gets unmounted, clear pending handles because image is not going to load
			return () => {
				unmounted = true;
				current.removeEventListener('load', onComplete);
				unblock();
				continueRender(newHandle);
			};
		}, [
			actualSrc,
			delayPlayback,
			delayRenderRetries,
			delayRenderTimeoutInMilliseconds,
			pauseWhenLoading,
			isPremounting,
			isPostmounting,
			onImageFrame,
			continueRender,
			delayRender,
		]);
	}

	const {isClientSideRendering, isRendering} = useRemotionEnvironment();

	const crossOriginValue = getCrossOriginValue({
		crossOrigin,
		requestsVideoFrame: false,
		isClientSideRendering,
	});

	// src gets set once we've loaded and decoded the image.
	return (
		<img
			{...props}
			ref={imageCallbackRef}
			crossOrigin={crossOriginValue}
			onError={didGetError}
			decoding={isRendering ? 'sync' : decoding}
		/>
	);
};

type NativeImgInnerProps = Omit<ImgProps, 'effects'> & {
	readonly controls: SequenceControls | undefined;
	readonly outlineRef: React.RefObject<HTMLElement | null>;
};

const NativeImgInner: React.FC<NativeImgInnerProps> = ({
	hidden,
	name,
	stack,
	showInTimeline,
	src,
	from,
	trimBefore,
	durationInFrames,
	freeze,
	controls,
	outlineRef: refForOutline,
	...props
}) => {
	if (!src) {
		throw new Error('No "src" prop was passed to <Img>.');
	}

	return (
		<Sequence
			layout="none"
			from={from ?? 0}
			trimBefore={trimBefore}
			durationInFrames={durationInFrames ?? Infinity}
			freeze={freeze}
			_remotionInternalStack={stack}
			_remotionInternalDocumentationLink="https://www.remotion.dev/docs/img"
			_remotionInternalIsMedia={{type: 'image', src}}
			name={name ?? '<Img>'}
			controls={controls}
			showInTimeline={showInTimeline ?? true}
			hidden={hidden}
			outlineRef={refForOutline}
		>
			<ImgContent src={src} refForOutline={refForOutline} {...props} />
		</Sequence>
	);
};

const CanvasImageWithPrivateProps = CanvasImage as React.ComponentType<
	CanvasImageProps & {
		readonly controls?: SequenceControls | undefined;
		readonly outlineRef?: React.RefObject<HTMLElement | null> | null;
	}
>;

export const imgSchema = {
	...baseSchema,
	...transformSchema,
} as const satisfies InteractivitySchema;

const imgCanvasFallbackIncompatibleProps = new Set([
	'alt',
	'crossOrigin',
	'decoding',
	'fetchPriority',
	'loading',
	'onError',
	'onImageFrame',
	'onLoad',
	'sizes',
	'srcSet',
	'useMap',
]);

const getIncompatiblePropNames = (props: Record<string, unknown>) =>
	Object.keys(props).filter(
		(key) =>
			props[key] !== undefined && imgCanvasFallbackIncompatibleProps.has(key),
	);

const formatPropList = (props: string[]) => {
	return props.map((prop) => `"${prop}"`).join(', ');
};

const validateCanvasImageFallbackProps = ({
	props,
	ref,
	width,
	height,
}: {
	readonly props: Record<string, unknown>;
	readonly ref: React.Ref<HTMLImageElement> | undefined;
	readonly width: ImgProps['width'];
	readonly height: ImgProps['height'];
}) => {
	if (typeof width === 'string' || typeof height === 'string') {
		throw new Error(
			'The "width" and "height" props must be numbers on <Img> when effects are passed, because <Img> renders a <CanvasImage>. Use numeric props or CSS dimensions in "style".',
		);
	}

	const conflictingProps = getIncompatiblePropNames(props);
	if (ref !== null && ref !== undefined) {
		conflictingProps.unshift('ref');
	}

	if (conflictingProps.length === 0) {
		return;
	}

	throw new Error(
		`The ${formatPropList(conflictingProps)} prop${
			conflictingProps.length === 1 ? '' : 's'
		} cannot be used on <Img> when effects are passed, because <Img> renders a <canvas> instead of a native <img>. Remove ${
			conflictingProps.length === 1 ? 'this prop' : 'these props'
		}.`,
	);
};

const getFitFromObjectFit = (
	style: React.CSSProperties | undefined,
): ImageFit | undefined => {
	const objectFit = style?.objectFit;

	if (
		objectFit === 'fill' ||
		objectFit === 'contain' ||
		objectFit === 'cover'
	) {
		return objectFit;
	}

	return undefined;
};

const ImgInner: React.FC<
	ImgProps & {
		readonly controls: SequenceControls | undefined;
	}
> = ({
	effects = [],
	ref,
	hidden,
	name,
	stack,
	showInTimeline,
	src,
	from,
	trimBefore,
	durationInFrames,
	freeze,
	controls,
	width,
	height,
	className,
	style,
	id,
	pauseWhenLoading,
	maxRetries,
	delayRenderRetries,
	delayRenderTimeoutInMilliseconds,
	...props
}) => {
	const refForOutline = useRef<HTMLElement | null>(null);

	if (effects.length === 0) {
		return (
			<NativeImgInner
				{...props}
				ref={ref}
				hidden={hidden}
				name={name}
				stack={stack}
				showInTimeline={showInTimeline}
				src={src}
				from={from}
				trimBefore={trimBefore}
				durationInFrames={durationInFrames}
				freeze={freeze}
				controls={controls}
				width={width}
				height={height}
				className={className}
				style={style}
				id={id}
				pauseWhenLoading={pauseWhenLoading}
				maxRetries={maxRetries}
				delayRenderRetries={delayRenderRetries}
				delayRenderTimeoutInMilliseconds={delayRenderTimeoutInMilliseconds}
				outlineRef={refForOutline}
			/>
		);
	}

	if (!src) {
		throw new Error('No "src" prop was passed to <Img>.');
	}

	validateCanvasImageFallbackProps({
		props,
		ref,
		width,
		height,
	});

	const canvasWidth = typeof width === 'number' ? width : undefined;
	const canvasHeight = typeof height === 'number' ? height : undefined;
	const canvasProps = props as CanvasImageCanvasProps;
	const canvasFit = getFitFromObjectFit(style) ?? 'fill';

	return (
		<CanvasImageWithPrivateProps
			src={src}
			width={canvasWidth}
			height={canvasHeight}
			fit={canvasFit}
			effects={effects}
			className={className}
			style={style}
			id={id}
			pauseWhenLoading={pauseWhenLoading}
			maxRetries={maxRetries}
			delayRenderRetries={delayRenderRetries}
			delayRenderTimeoutInMilliseconds={delayRenderTimeoutInMilliseconds}
			from={from}
			trimBefore={trimBefore}
			durationInFrames={durationInFrames}
			freeze={freeze}
			hidden={hidden}
			name={name ?? '<Img>'}
			showInTimeline={showInTimeline}
			stack={stack}
			_remotionInternalDocumentationLink="https://www.remotion.dev/docs/img"
			controls={controls}
			outlineRef={refForOutline}
			{...canvasProps}
		/>
	);
};

/*
 * @description Works just like a regular HTML img tag. When you use the <Img> tag, Remotion will ensure that the image is loaded before rendering the frame.
 * @see [Documentation](https://remotion.dev/docs/img)
 */
export const Img = withInteractivitySchema({
	Component: ImgInner,
	componentName: '<Img>',
	componentIdentity: 'dev.remotion.remotion.Img',
	schema: imgSchema,
	supportsEffects: true,
});
addSequenceStackTraces(Img);
