import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import {continueRender, delayRender} from './delay-render';

const ImgRefForwarding: React.ForwardRefRenderFunction<
	HTMLImageElement,
	React.DetailedHTMLProps<
		React.ImgHTMLAttributes<HTMLImageElement>,
		HTMLImageElement
	>
> = ({onLoad, onError, ...props}, ref) => {
	const [handle, setHandle] = useState<ReturnType<typeof delayRender> | null>(
		() => {
			return null;
		}
	);
	const imageRef = useRef<HTMLImageElement>(null);

	useImperativeHandle(ref, () => {
		return imageRef.current as HTMLImageElement;
	});

	useEffect(() => {
		if (
			ref &&
			(ref as React.MutableRefObject<HTMLImageElement>).current.complete &&
			handle
		) {
			continueRender(handle);
		}
	}, [handle, ref]);

	const didLoad = useCallback(
		(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
			if (handle) {
				continueRender(handle);
			}

			onLoad?.(e);
		},
		[handle, onLoad]
	);

	const didGetError = useCallback(
		(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
			if (handle) {
				continueRender(handle);
			}

			if (onError) {
				onError(e);
			} else {
				console.error(
					'Error loading image:',
					e,
					'Handle the event using the onError() prop to make this message disappear.'
				);
			}
		},
		[handle, onError]
	);

	// If image source switches, make new handle
	useEffect(() => {
		const newHandle = delayRender('Loading <Img> with src=' + props.src);
		setHandle(newHandle);

		// If tag gets unmounted, clear pending handles because image is not going to load
		return () => {
			continueRender(newHandle);
		};
	}, [props.src]);

	return (
		<img {...props} ref={imageRef} onLoad={didLoad} onError={didGetError} />
	);
};

export const Img = forwardRef(ImgRefForwarding);
