import React, {forwardRef, useCallback, useEffect, useState} from 'react';
import {continueRender, delayRender} from './ready-manager';

const ImgRefForwarding: React.ForwardRefRenderFunction<
	HTMLImageElement,
	React.DetailedHTMLProps<
		React.ImgHTMLAttributes<HTMLImageElement>,
		HTMLImageElement
	>
> = ({onLoad, onError, ...props}, ref) => {
	const [handle] = useState(() => delayRender());

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

	return <img {...props} ref={ref} onLoad={didLoad} onError={didGetError} />;
};

export const Img = forwardRef(ImgRefForwarding);
