import type {PropsWithChildren} from 'react';
import React, {useContext, useEffect, useMemo} from 'react';
import {AbsoluteFill} from './AbsoluteFill';
import {CompositionManager} from './CompositionManager';

export const Clipper: React.FC<
	PropsWithChildren<{
		width: number;
		height: number;
		x: number;
		y: number;
	}>
> = ({height, width, x, y, children}) => {
	const context = useContext(CompositionManager);

	useEffect(() => {
		context.setClipRegion({height, width, x, y});

		return () => {
			context.setClipRegion(null);
		};
	}, [context, height, width, x, y]);

	const style: React.CSSProperties = useMemo(() => {
		return {
			clipPath: `polygon(${x}px ${y}px, ${x}px ${height + y}px, ${
				width + x
			}px ${height + y}px, ${width + x}px ${y}px)`,
		};
	}, [height, width, x, y]);

	return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};
