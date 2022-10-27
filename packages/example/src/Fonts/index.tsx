import {loadFont} from '@remotion/google-fonts/AreYouSerious';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const {fontFamily} = loadFont('normal', {
	subsets: ['latin', 'latin-ext', 'vietnamese'],
	weights: ['400'],
});

export const FontDemo: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				fontFamily,
				fontSize: 100,
				backgroundColor: 'whitesmoke',
			}}
		>
			<h1>Font Demo</h1>
		</AbsoluteFill>
	);
};
