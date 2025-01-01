import React, {forwardRef, useCallback, useState} from 'react';
import {continueRender, delayRender} from './delay-render.js';

const IFrameRefForwarding: React.ForwardRefRenderFunction<
	HTMLIFrameElement,
	React.DetailedHTMLProps<
		React.IframeHTMLAttributes<HTMLIFrameElement>,
		HTMLIFrameElement
	> & {
		readonly delayRenderRetries?: number;
		readonly delayRenderTimeoutInMilliseconds?: number;
	}
> = (
	{
		onLoad,
		onError,
		delayRenderRetries,
		delayRenderTimeoutInMilliseconds,
		...props
	},
	ref,
) => {
	const [handle] = useState(() =>
		delayRender(`Loading <IFrame> with source ${props.src}`, {
			retries: delayRenderRetries ?? undefined,
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
		}),
	);

	const didLoad = useCallback(
		(e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
			continueRender(handle);
			onLoad?.(e);
		},
		[handle, onLoad],
	);

	const didGetError = useCallback(
		(e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
			continueRender(handle);
			if (onError) {
				onError(e);
			} else {
				// eslint-disable-next-line no-console
				console.error(
					'Error loading iframe:',
					e,
					'Handle the event using the onError() prop to make this message disappear.',
				);
			}
		},
		[handle, onError],
	);

	return <iframe {...props} ref={ref} onError={didGetError} onLoad={didLoad} />;
};

/*
 * @description The <IFrame /> can be used like a regular <iframe> HTML tag.
 * @see [Documentation](https://remotion.dev/docs/iframe)
 */
export const IFrame = forwardRef(IFrameRefForwarding);
