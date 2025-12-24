import React, {
	forwardRef,
	useCallback,
	useContext,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
} from 'react';
import {SequenceContext} from './SequenceContext.js';
import type {IsExact} from './audio/props.js';
import {cancelRender} from './cancel-render.js';
import {getCrossOriginValue} from './get-cross-origin-value.js';
import {usePreload} from './prefetch.js';
import {useBufferState} from './use-buffer-state.js';
import {useDelayRender} from './use-delay-render.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';

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
	readonly onImageFrame?: (imgelement: HTMLImageElement) => void;
	readonly src: string;
};

type Expected = Omit<NativeImgProps, 'onError' | 'src' | 'crossOrigin'>;

const ImgRefForwarding: React.ForwardRefRenderFunction<
	HTMLImageElement,
	ImgProps
> = (
	{
		onError,
		maxRetries = 2,
		src,
		pauseWhenLoading,
		delayRenderRetries,
		delayRenderTimeoutInMilliseconds,
		onImageFrame,
		crossOrigin,
		...props
	},
	ref,
) => {
	const imageRef = useRef<HTMLImageElement>(null);
	const errors = useRef<Record<string, number>>({});
	const {delayPlayback} = useBufferState();
	const sequenceContext = useContext(SequenceContext);

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
					`Could not load image with source ${
						imageRef.current?.src as string
					}, retrying again in ${backoff}ms`,
				);

				retryIn(backoff);
				return;
			}

			cancelRender(
				'Error loading image with src: ' + (imageRef.current?.src as string),
			);
		},
		[maxRetries, onError, retryIn],
	);

	const {delayRender, continueRender} = useDelayRender();

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

			const newHandle = delayRender('Loading <Img> with src=' + actualSrc, {
				retries: delayRenderRetries ?? undefined,
				timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
			});
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
						`Retry successful - ${
							imageRef.current?.src as string
						} is now loaded`,
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

					if (current.complete) {
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
export const Img = forwardRef(ImgRefForwarding);
