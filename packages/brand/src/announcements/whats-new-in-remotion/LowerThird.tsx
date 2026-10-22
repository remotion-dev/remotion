import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';

export const LowerThird: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				padding: 70,
				justifyContent: 'flex-end',
				alignItems: 'flex-start',
			}}
		>
			<Interactive.Div
				name="Presenter card"
				style={{
					backgroundColor: 'white',
					fontFamily: 'GT Planar',
					fontFeatureSettings: "'ss03' 1",
					padding: '24px 44px',
					borderRadius: 18,
					boxShadow: '0 0 30px rgba(0, 0, 0, 0.1)',
					translate: interpolate(
						frame,
						[0, 23, 84, 107],
						['0px 400px', '0px 0px', '0px 0px', '0px 400px'],
						{
							easing: [
								Easing.spring({damping: 200}),
								Easing.linear,
								Easing.spring({damping: 200}),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					rotate: interpolate(
						frame,
						[0, 23, 84, 107],
						['-5.4deg', '0deg', '0deg', '-5.4deg'],
						{
							easing: [
								Easing.spring({damping: 200}),
								Easing.linear,
								Easing.spring({damping: 200}),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			>
				<Interactive.Div
					name="Presenter name"
					style={{fontSize: 50, fontWeight: 700, color: '#111'}}
				>
					Jonny Burger
				</Interactive.Div>
				<Interactive.Div
					name="Presenter role"
					style={{
						fontSize: 36,
						fontWeight: 400,
						marginTop: -12,
						color: '#4290f5',
					}}
				>
					Chief Hacker, Remotion
				</Interactive.Div>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
