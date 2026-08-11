import {Circle} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const CircleTest: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignContent: 'center',
				alignItems: 'center',
			}}
		>
			<Circle radius={100} fill="green" stroke="red" strokeWidth={10} />
		</AbsoluteFill>
	);
};

export default CircleTest;
