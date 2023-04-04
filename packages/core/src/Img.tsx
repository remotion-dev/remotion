import React, {
	forwardRef,
	useCallback,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
} from 'react';
import {continueRender, delayRender} from './delay-render.js';
import {useRemotionEnvironment} from './get-environment.js';
import {usePreload} from './prefetch.js';

function exponentialBackoff(errorCount: number): number {
	return 1000 * 2 ** errorCount;
}

const ImgRefForwarding: React.ForwardRefRenderFunction<
	HTMLImageElement,
	React.DetailedHTMLProps<
		React.ImgHTMLAttributes<HTMLImageElement>,
		HTMLImageElement
	> & {
		maxRetries?: number;
	}
> = ({onError, maxRetries = 2, src, ...props}, ref) => {
	const imageRef = useRef<HTMLImageElement>(null);
	const errors = useRef<Record<string, number>>({});

	const environment = useRemotionEnvironment();

	useImperativeHandle(
		ref,
		() => {
			return imageRef.current as HTMLImageElement;
		},
		[]
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

			errors.current[actualSrc] = (errors.current[actualSrc] ?? 0) + 1;
			if (onError && (errors.current[actualSrc] ?? 0) > maxRetries) {
				onError(e);
				return;
			}

			if ((errors.current[actualSrc] ?? 0) <= maxRetries) {
				const backoff = exponentialBackoff(errors.current[actualSrc] ?? 0);
				console.warn(
					`Could not load image with source ${
						imageRef.current?.src as string
					}, retrying again in ${backoff}ms`
				);

				retryIn(backoff);
				return;
			}

			console.error(
				'Error loading image with src:',
				imageRef.current?.src,
				e,
				'Handle the event using the onError() prop to make this message disappear.'
			);
		},
		[actualSrc, maxRetries, onError, retryIn]
	);

	// If image source switches, make new handle
	if (environment === 'rendering') {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useLayoutEffect(() => {
			if (process.env.NODE_ENV === 'test') {
				return;
			}

			const newHandle = delayRender('Loading <Img> with src=' + src);
			const {current} = imageRef;

			const didLoad = () => {
				if ((errors.current[actualSrc] ?? 0) > 0) {
					delete errors.current[actualSrc];
					console.info(`Retry successful - ${actualSrc} was loaded`);
				}

				continueRender(newHandle);
			};

			if (current?.complete) {
				continueRender(newHandle);
			} else {
				current?.addEventListener('load', didLoad, {once: true});
			}

			// If tag gets unmounted, clear pending handles because image is not going to load
			return () => {
				current?.removeEventListener('load', didLoad);
				continueRender(newHandle);
			};
		}, [src]);
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
