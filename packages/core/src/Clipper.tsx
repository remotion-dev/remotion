import type {PropsWithChildren} from 'react';
import React, {useContext, useEffect} from 'react';
import {AbsoluteFill} from './AbsoluteFill';
import {CompositionManager} from './CompositionManager';

export const Clipper: React.FC<
	PropsWithChildren<{
		width: number;
		height: number;
		x: number;
		y: number;
		hide?: boolean;
	}>
> = ({height, width, x, y, hide, children}) => {
	const context = useContext(CompositionManager);

	useEffect(() => {
		context.setClipRegion({height, hide: Boolean(hide), width, x, y});

		return () => {
			context.setClipRegion(null);
		};
	}, [context, height, hide, width, x, y]);

	return <AbsoluteFill>{children}</AbsoluteFill>;
};
