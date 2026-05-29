import React from 'react';
import {Img, staticFile} from 'remotion';

export const SimpleImg = (): React.ReactNode => {
	return <Img src={staticFile('1.jpg')} effects={[]} />;
};
