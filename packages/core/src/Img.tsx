import React, {forwardRef, useCallback, useState} from 'react';
import {continueRender, delayRender} from './ready-manager';

const ImgRefForwarding: React.ForwardRefRenderFunction<
	HTMLImageElement,
	React.DetailedHTMLProps<
		React.ImgHTMLAttributes<HTMLImageElement>,
		HTMLImageElement
	>
> = ({onLoad, ...props}, ref) => {
	const [handle] = useState(() => delayRender());

	const didLoad = useCallback(
		(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
			continueRender(handle);
			onLoad?.(e);
		},
		[handle, onLoad]
	);

	return <img {...props} ref={ref} onLoad={didLoad} />;
};

export const Img = forwardRef(ImgRefForwarding);
