import React, {useLayoutEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {ZIndexContextProvider, useZIndex} from '../state/z-index';
import {getPortal} from './Menu/portals';

export const TopmostPortal: React.FC<{
	readonly children: React.ReactNode;
	readonly disabled: boolean;
}> = ({children, disabled}) => {
	const {currentZIndex, highestZIndex} = useZIndex();
	const [host] = useState(() => document.createElement('div'));
	const parentIndex = useRef(Math.max(currentZIndex, highestZIndex));
	const wasDisabled = useRef(disabled);

	// Keep the portal container stable when toggling visibility. Moving the host
	// preserves mounted children such as the Ask AI iframe.
	if (!disabled && wasDisabled.current) {
		parentIndex.current = Math.max(currentZIndex, highestZIndex);
	}

	wasDisabled.current = disabled;

	useLayoutEffect(() => {
		host.style.display = disabled ? 'none' : '';
		if (!disabled) {
			getPortal(parentIndex.current).appendChild(host);
		}
	}, [disabled, host]);

	useLayoutEffect(() => {
		return () => host.remove();
	}, [host]);

	return ReactDOM.createPortal(
		<ZIndexContextProvider
			currentIndex={disabled ? currentZIndex : parentIndex.current}
		>
			{children}
		</ZIndexContextProvider>,
		host,
	);
};
