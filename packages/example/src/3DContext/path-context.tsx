import {getBoundingBox} from '@remotion/paths';
import {makeRect} from '@remotion/shapes';
import React, {useMemo} from 'react';

type PathContext = {
	height: number;
	width: number;
	path: string;
	viewBox: string;
	left: number;
	top: number;
};

export const pathContext = React.createContext<PathContext | null>(null);

export const RectProvider: React.FC<{
	readonly width: number;
	readonly height: number;
	readonly cornerRadius: number;
	readonly children: React.ReactNode;
}> = ({cornerRadius, height, width, children}) => {
	const {path} = makeRect({height, width, cornerRadius});

	const viewBox = `0 0 ${width} ${height}`;

	const value: PathContext = useMemo(() => {
		return {height, width, path, viewBox, left: 0, top: 0};
	}, [height, path, viewBox, width]);

	return <pathContext.Provider value={value}>{children}</pathContext.Provider>;
};

export const PathProvider: React.FC<{
	readonly d: string;
	readonly children: React.ReactNode;
}> = ({children, d}) => {
	const {height, width, viewBox, x1, y1} = getBoundingBox(d);

	const value: PathContext = useMemo(() => {
		return {height, width, path: d, viewBox, left: x1, top: y1};
	}, [d, height, viewBox, width, x1, y1]);

	return <pathContext.Provider value={value}>{children}</pathContext.Provider>;
};

export const useRect = () => {
	const value = React.useContext(pathContext);

	if (!value) {
		throw new Error('useRect must be used within a RectProvider');
	}

	return value;
};
