import {Square} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const SquareTest: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignContent: 'center',
				alignItems: 'center',
			}}
		>
			<Square width={200} height={400} fill="red" />
		</AbsoluteFill>
	);
};

export default SquareTest;
