import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

export const ProresTest: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'red',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<h1 style={{fontSize: '80px'}}>{frame}</h1>
		</AbsoluteFill>
	);
};
