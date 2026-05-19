import {getBoundingBox} from '@remotion/paths';
import {makeRect} from '@remotion/shapes';
import React, {useMemo} from 'react';
import {pathContext} from './path-context-context';

export const RectProvider: React.FC<{
	readonly width: number;
	readonly height: number;
	readonly cornerRadius: number;
	readonly children: React.ReactNode;
}> = ({cornerRadius, height, width, children}) => {
	const maxCornerRadius = Math.min(cornerRadius, width / 2, height / 2);
	const {path} = makeRect({height, width, cornerRadius: maxCornerRadius});

	const viewBox = `0 0 ${width} ${height}`;

	const value = useMemo(() => {
		return {height, width, path, viewBox, left: 0, top: 0};
	}, [height, path, viewBox, width]);

	return <pathContext.Provider value={value}>{children}</pathContext.Provider>;
};

export const PathProvider: React.FC<{
	readonly d: string;
	readonly children: React.ReactNode;
}> = ({children, d}) => {
	const {height, width, viewBox, x1, y1} = getBoundingBox(d);

	const value = useMemo(() => {
		return {height, width, path: d, viewBox, left: x1, top: y1};
	}, [d, height, viewBox, width, x1, y1]);

	return <pathContext.Provider value={value}>{children}</pathContext.Provider>;
};
