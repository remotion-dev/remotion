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
				innerRadius={215}
				outerRadius={286}
				cornerRadius={0}
				fill={'#0F84F3'}
				style={{
					translate: interpolate(
						frame,
						[15, 39, 43, 49],
						['0px 1309.7px', '0px 0px', '401.8px 456.6px', '105.3px 244.3px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.bezier(0.42, 0, 1, 1),
								Easing.linear,
								Easing.linear,
							],
						},
					),
					rotate: '0.036428deg',
					scale: 1.664497,
				}}
			/>
		</AbsoluteFill>
	);
};

export default CenteredSolid;
