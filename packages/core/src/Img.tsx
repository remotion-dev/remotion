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
	const [handle] = useState(() =>
		delayRender('Loading <Img> with src=' + props.src)
	);
	const imageRef = useRef<HTMLImageElement>(null);

	useImperativeHandle(ref, () => {
		return imageRef.current as HTMLImageElement;
	});

	useEffect(() => {
		if (
			ref &&
			(ref as React.MutableRefObject<HTMLImageElement>).current.complete
		) {
			continueRender(handle);
		}
	}, [handle, ref]);

	const didLoad = useCallback(
		(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
			continueRender(handle);
			onLoad?.(e);
		},
		[handle, onLoad]
	);

	const didGetError = useCallback(
		(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
			continueRender(handle);
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

	// If tag gets unmounted, clear pending handles because image is not going to load
	useEffect(() => {
		return () => {
			continueRender(handle);
		};
	}, [handle]);

	return (
		<img {...props} ref={imageRef} onLoad={didLoad} onError={didGetError} />
	);
};

export const Img = forwardRef(ImgRefForwarding);
