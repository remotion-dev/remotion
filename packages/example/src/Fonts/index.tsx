import {loadFont} from '@remotion/google-fonts/Montserrat';
import React from 'react';
import {AbsoluteFill} from 'remotion';

loadFont('italic', {
	subsets: ['latin', 'latin-ext', 'vietnamese'],
	weights: ['400'],
});

export const FontDemo: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				fontFamily: 'Bangers',
				fontSize: 300,
			}}
		>
			<h1>Font Demo</h1>
		</AbsoluteFill>
	);
};
