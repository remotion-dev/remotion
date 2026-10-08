import React, {forwardRef, useCallback, useLayoutEffect, useRef} from 'react';
import {useDelayRender} from './use-delay-render.js';

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
	const {delayRender, continueRender} = useDelayRender();
	const handle = useRef<number | null>(null);
	const loadedSource = useRef<{
		src: string | undefined;
		srcDoc: string | undefined;
	} | null>(null);
	const {src, srcDoc} = props;

	useLayoutEffect(() => {
		if (
			loadedSource.current?.src === src &&
			loadedSource.current?.srcDoc === srcDoc &&
			loadedSource.current !== null
		) {
			return;
		}

		const newHandle = delayRender(`Loading <IFrame> with source ${src}`, {
			retries: delayRenderRetries ?? undefined,
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
		});
		loadedSource.current = null;
		handle.current = newHandle;
		return () => {
			continueRender(newHandle);
			handle.current = null;
		};
	}, [
		continueRender,
		delayRender,
		delayRenderRetries,
		delayRenderTimeoutInMilliseconds,
		src,
		srcDoc,
	]);

	const didLoad = useCallback(
		(e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
			loadedSource.current = {src, srcDoc};
			if (handle.current !== null) {
				continueRender(handle.current);
				handle.current = null;
			}

			onLoad?.(e);
		},
		[onLoad, continueRender, src, srcDoc],
	);

	const didGetError = useCallback(
		(e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
			loadedSource.current = {src, srcDoc};
			if (handle.current !== null) {
				continueRender(handle.current);
				handle.current = null;
			}

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
		[onError, continueRender, src, srcDoc],
	);

	return (
		<iframe
			referrerPolicy="strict-origin-when-cross-origin"
			{...props}
			ref={ref}
			onError={didGetError}
			onLoad={didLoad}
		/>
	);
};

/*
 * @description The <IFrame /> can be used like a regular <iframe> HTML tag.
 * @see [Documentation](https://remotion.dev/docs/iframe)
 */
export const IFrame = forwardRef(IFrameRefForwarding);
