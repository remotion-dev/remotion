import React, {
	forwardRef,
	useCallback,
	useContext,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
} from 'react';
import {SequenceContext} from './SequenceContext.js';
import {cancelRender} from './cancel-render.js';
import {continueRender, delayRender} from './delay-render.js';
import {usePreload} from './prefetch.js';
import {useBufferState} from './use-buffer-state.js';

function exponentialBackoff(errorCount: number): number {
	return 1000 * 2 ** (errorCount - 1);
}

export type ImgProps = Omit<
	React.DetailedHTMLProps<
		React.ImgHTMLAttributes<HTMLImageElement>,
		HTMLImageElement
	>,
	'src'
> & {
	readonly maxRetries?: number;
	readonly pauseWhenLoading?: boolean;
	readonly delayRenderRetries?: number;
	readonly delayRenderTimeoutInMilliseconds?: number;
	readonly src: string;
};

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

	useImperativeHandle(
		ref,
		() => {
			return imageRef.current as HTMLImageElement;
		},
		[],
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

	if (typeof window !== 'undefined') {
		const isPremounting = Boolean(sequenceContext?.premounting);
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useLayoutEffect(() => {
			if (window.process?.env?.NODE_ENV === 'test') {
				return;
			}

			const newHandle = delayRender('Loading <Img> with src=' + actualSrc, {
				retries: delayRenderRetries ?? undefined,
				timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
			});
			const unblock =
				pauseWhenLoading && !isPremounting
					? delayPlayback().unblock
					: () => undefined;
			const {current} = imageRef;

			const onComplete = () => {
				if ((errors.current[imageRef.current?.src as string] ?? 0) > 0) {
					delete errors.current[imageRef.current?.src as string];
					// eslint-disable-next-line no-console
					console.info(
						`Retry successful - ${
							imageRef.current?.src as string
						} is now loaded`,
					);
				}

				unblock();
				continueRender(newHandle);
			};

			const didLoad = () => {
				onComplete();
			};

			if (current?.complete) {
				onComplete();
			} else {
				current?.addEventListener('load', didLoad, {once: true});
			}

			// If tag gets unmounted, clear pending handles because image is not going to load
			return () => {
				current?.removeEventListener('load', didLoad);
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
		]);
	}

	return (
		<img {...props} ref={imageRef} src={actualSrc} onError={didGetError} />
	);
};

/**
 * @description Works just like a regular HTML img tag. When you use the <Img> tag, Remotion will ensure that the image is loaded before rendering the frame.
 * @see [Documentation](https://www.remotion.dev/docs/img)
 */
export const Img = forwardRef(ImgRefForwarding);
