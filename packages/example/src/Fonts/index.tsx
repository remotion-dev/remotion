import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill} from 'remotion';

loadFont({
	family: 'Bangers',
	url: 'bangers.woff2',
	weight: '500',
}).then(() => console.log('Font loaded!'));

export const FontDemo: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				fontFamily: 'Bangers',
				justifyContent: 'center',
				alignItems: 'center',
				fontSize: 100,
				backgroundColor: 'whitesmoke',
			}}
		>
			<h1>Font Demo</h1>
		</AbsoluteFill>
	);
};
