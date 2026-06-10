import {Star} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';

const CenteredSolid: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: 'white',
			}}
		>
			<Star
				points={26}
				innerRadius={241}
				outerRadius={200}
				cornerRadius={0}
				fill={'#aaadb1'}
				style={{
					position: 'absolute',
					scale: 0.87,
					translate: interpolate(frame, [19], ['0px 89px'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			/>
		</AbsoluteFill>
	);
};

export default CenteredSolid;
