import React from 'react';
import {Img, staticFile} from 'remotion';

export const StaticDemo: React.FC = () => {
	return (
		<>
			<Img src={staticFile('logo.png')} />
			<Img src="/logo.png" />
		</>
	);
};
