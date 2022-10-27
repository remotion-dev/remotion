import {loadFont} from '@remotion/google-fonts/Genos';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const {fontFamily} = loadFont('normal', {
	weights: ['900', '500'],
});

export const FontDemo: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				fontFamily,
				fontSize: 200,
				backgroundColor: 'whitesmoke',
			}}
		>
			<h1>Font Demo</h1>
		</AbsoluteFill>
	);
};
