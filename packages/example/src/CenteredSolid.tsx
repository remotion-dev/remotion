import {Star} from '@remotion/shapes';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const CenteredSolid: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const pop = spring({
		frame: frame - 22,
		fps,
		config: {
			damping: 9,
			mass: 0.7,
			stiffness: 180,
		},
	});
	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				// backgroundColor: 'white',
			}}
		>
			<Interactive.Div
				style={{
					position: 'absolute',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					translate: interpolate(
						frame,
						[8, 28],
						['0px 864.5px', '0px -0.2px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [Easing.bezier(0.2123, 0.0084, 0.6078, 0.9497)],
						},
					),
					scale: String(pop),
					rotate: `${interpolate(pop, [0, 1], [-12, 0])}deg`,
					opacity: interpolate(pop, [0, 0.4], [0, 1], {
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<Star
					points={26}
					innerRadius={241}
					outerRadius={200}
					cornerRadius={0}
					fill={'#0F84F3'}
					style={{
						rotate: interpolate(frame, [0, 59], ['0deg', '30deg'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				/>
				<div
					style={{
						position: 'absolute',
						display: 'flex',
						fontSize: 150,
						color: 'white',
						fontWeight: 'bold',
						letterSpacing: '-0.02em',
						fontFamily: 'GT Planar',
					}}
				>
					{'New'.split('').map((letter, i) => {
						const jump = spring({
							frame: frame - 24 - i * 4,
							fps,
							config: {
								damping: 12,
								mass: 0.6,
								stiffness: 200,
							},
						});
						return (
							<span
								// eslint-disable-next-line react/no-array-index-key
								key={i}
								style={{
									display: 'inline-block',
									translate: `0px ${interpolate(jump, [0, 1], [140, 0])}px`,
									opacity: jump,
								}}
							>
								{letter}
							</span>
						);
					})}
				</div>
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export default CenteredSolid;
