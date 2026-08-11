import {NoReactInternals} from 'remotion/no-react';

export const colorToRgb = (color: string): [number, number, number] => {
	const packed = NoReactInternals.processColor(color);

	return [(packed >>> 16) & 255, (packed >>> 8) & 255, packed & 255];
};
