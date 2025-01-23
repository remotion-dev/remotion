import {makeRect} from '@remotion/shapes';
import React, {useMemo} from 'react';

type PathContext = {
	height: number;
	width: number;
	path: string;
	viewBox: string;
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

	const value = useMemo(() => {
		return {height, width, path, viewBox};
	}, [height, path, viewBox, width]);

	return <pathContext.Provider value={value}>{children}</pathContext.Provider>;
};

export const useRect = () => {
	const value = React.useContext(pathContext);

	if (!value) {
		throw new Error('useRect must be used within a RectProvider');
	}

	return value;
};
