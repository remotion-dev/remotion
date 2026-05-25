import React from 'react';
import {CanvasImage, staticFile} from 'remotion';

export const CanvasImg = (): React.ReactNode => {
	return <CanvasImage src={staticFile('1.jpg')} />;
};
