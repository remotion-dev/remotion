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

const ImgRefForwarding: React.ForwardRefRenderFunction<
	HTMLImageElement,
	React.DetailedHTMLProps<
		React.ImgHTMLAttributes<HTMLImageElement>,
		HTMLImageElement
	>
> = ({onError, src, ...props}, ref) => {
	const imageRef = useRef<HTMLImageElement>(null);

	const environment = useRemotionEnvironment();

	useImperativeHandle(
		ref,
		() => {
			return imageRef.current as HTMLImageElement;
		},
		[]
	);

	const actualSrc = usePreload(src as string);

	const didGetError = useCallback(
		(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
			if (onError) {
				onError(e);
			} else {
				console.error(
					'Error loading image with src:',
					imageRef.current?.src,
					e,
					'Handle the event using the onError() prop to make this message disappear.'
				);
			}
		},
		[onError]
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
