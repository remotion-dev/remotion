import {Rect} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const RectTest: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignContent: 'center',
				alignItems: 'center',
			}}
		>
			<Rect width={200} height={400} />
		</AbsoluteFill>
	);
};

export default RectTest;
