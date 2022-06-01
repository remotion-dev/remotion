import React, {forwardRef, useCallback, useState} from 'react';
import {continueRender, delayRender} from './delay-render';

const IFrameRefForwarding: React.ForwardRefRenderFunction<
	HTMLIFrameElement,
	React.DetailedHTMLProps<
		React.IframeHTMLAttributes<HTMLIFrameElement>,
		HTMLIFrameElement
	>
> = ({onLoad, onError, ...props}, ref) => {
	const [handle] = useState(() =>
		delayRender(`Loading <IFrame> with source ${props.src}`)
	);

	const didLoad = useCallback(
		(e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
			continueRender(handle);
			onLoad?.(e);
		},
		[handle, onLoad]
	);

	const didGetError = useCallback(
		(e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
			continueRender(handle);
			if (onError) {
				onError(e);
			} else {
				console.error(
					'Error loading iframe:',
					e,
					'Handle the event using the onError() prop to make this message disappear.'
				);
			}
		},
		[handle, onError]
	);

	return <iframe {...props} ref={ref} onError={didGetError} onLoad={didLoad} />;
};

export const IFrame = forwardRef(IFrameRefForwarding);
