import React from 'react';
import {AbsoluteFill} from 'remotion';

export const FontDemo: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				fontSize: 200,
				backgroundColor: 'whitesmoke',
			}}
		>
			<h1>Font Demo</h1>
		</AbsoluteFill>
	);
};
