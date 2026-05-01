import React, {
	useCallback,
	useContext,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import type {IsExact} from './audio/props.js';
import type {SequenceControls} from './CompositionManager.js';
import {addSequenceStackTraces} from './enable-sequence-stack-traces.js';
import {getCrossOriginValue} from './get-cross-origin-value.js';
import {usePreload} from './prefetch.js';
import type {SequenceSchema} from './sequence-field-schema.js';
import {SequenceContext} from './SequenceContext.js';
import {useBufferState} from './use-buffer-state.js';
import {useDelayRender} from './use-delay-render.js';
import {useImageInTimeline} from './use-media-in-timeline.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
import {wrapInSchema} from './wrap-in-schema.js';

function exponentialBackoff(errorCount: number): number {
	return 1000 * 2 ** (errorCount - 1);
}

// Data URLs like the ones from canvas.toDataURL() can be many megabytes, which makes the delayRender() label
// unreadable and bloats log output
export function truncateSrcForLabel(src: string): string {
	if (src.startsWith('data:') && src.length > 100) {
		return src.slice(0, 60) + '...[' + src.length + ' chars total]';
	}

	return src;
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
	readonly showInTimeline?: boolean;
	readonly name?: string;
	/**
	 * @deprecated For internal use only
	 */
	readonly stack?: string;
};

type Expected = Omit<NativeImgProps, 'onError' | 'src' | 'crossOrigin' | 'ref'>;

const imgSchema = {
	'style.translate': {
		type: 'translate',
		step: 1,
		default: '0px 0px',
		description: 'Position',
	},
	'style.scale': {
		type: 'number',
		min: 0.05,
		max: 100,
		step: 0.01,
		default: 1,
		description: 'Scale',
	},
	'style.rotate': {
		type: 'rotation',
		step: 1,
		default: '0deg',
		description: 'Rotation',
	},
	'style.opacity': {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 1,
		description: 'Opacity',
	},
} as const satisfies SequenceSchema;

const ImgInner: React.FC<
	ImgProps & {
		readonly _experimentalControls: SequenceControls | undefined;
	}
> = ({
	onError,
	maxRetries = 2,
	src,
	pauseWhenLoading,
	delayRenderRetries,
	delayRenderTimeoutInMilliseconds,
	onImageFrame,
	crossOrigin,
	showInTimeline,
	name,
	stack,
	ref,
	_experimentalControls: controls,
	...props
}) => {
	const imageRef = useRef<HTMLImageElement>(null);
	const errors = useRef<Record<string, number>>({});
	const {delayPlayback} = useBufferState();
	const sequenceContext = useContext(SequenceContext);
	const [timelineId] = useState(() => String(Math.random()));

	if (!src) {
		throw new Error('No "src" prop was passed to <Img>.');
	}

	const _propsValid: IsExact<typeof props, Expected> = true;

	if (!_propsValid) {
		throw new Error('typecheck error');
	}

	useImperativeHandle(ref, () => {
		return imageRef.current as HTMLImageElement;
	}, []);

	useImageInTimeline({
		src,
		displayName: name ?? null,
		id: timelineId,
		stack: stack ?? null,
		showInTimeline: showInTimeline ?? true,
		premountDisplay: sequenceContext?.premountDisplay ?? null,
		postmountDisplay: sequenceContext?.postmountDisplay ?? null,
		loopDisplay: undefined,
		controls: controls ?? null,
	});

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

	const {isClientSideRendering} = useRemotionEnvironment();

	const crossOriginValue = getCrossOriginValue({
		crossOrigin,
		requestsVideoFrame: false,
		isClientSideRendering,
	});

	// src gets set once we've loaded and decoded the image.
	return (
		<img
			{...props}
			ref={imageRef}
			crossOrigin={crossOriginValue}
			onError={didGetError}
			decoding="sync"
		/>
	);
};

/*
 * @description Works just like a regular HTML img tag. When you use the <Img> tag, Remotion will ensure that the image is loaded before rendering the frame.
 * @see [Documentation](https://remotion.dev/docs/img)
 */
export const Img = wrapInSchema(ImgInner, imgSchema);
addSequenceStackTraces(Img);
