import {zigzag} from '@remotion/effects/zigzag';
import {Video} from '@remotion/media';
import {Star} from '@remotion/shapes';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	useCurrentFrame,
	staticFile,
	Easing,
} from 'remotion';

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
				innerRadius={425}
				outerRadius={286}
				cornerRadius={0}
				fill={'#0F84F3'}
				style={{
					rotate: '0.036428deg',
				}}
			/>
		</AbsoluteFill>
	);
};

export default CenteredSolid;
