import {Star} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill} from 'remotion';
const StarTest: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignContent: 'center',
				alignItems: 'center',
				flexDirection: 'row',
			}}
		>
			<Star points={5} innerRadius={80} outerRadius={200} />
		</AbsoluteFill>
	);
};

export default StarTest;
