import React from 'react';

export type PathContext = {
	height: number;
	width: number;
	path: string;
	viewBox: string;
	left: number;
	top: number;
};

export const pathContext = React.createContext<PathContext | null>(null);
