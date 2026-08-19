import {loadFont} from '@remotion/google-fonts/Inter';
import React from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['500', '700'],
});

export const NameLowerThird: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			name="Container"
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'flex-start',
				width: 534,
				height: 132,
				boxSizing: 'border-box',
				fontFamily: 'Inter',
			}}
		>
			<Interactive.Div
				cropRight={interpolate(frame, [0, 20, 96, 116], [1, 0, 0, 1], {
					easing: [
						Easing.bezier(0.65, 0, 0.35, 1),
						Easing.linear,
						Easing.bezier(0.65, 0, 0.35, 1),
					],
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				name="Name bar"
				style={{
					display: 'flex',
					alignItems: 'center',
					width: 410,
					height: 66,
					boxSizing: 'border-box',
					padding: '0 24px',
					overflow: 'hidden',
					backgroundColor: '#2563eb',
					color: '#ffffff',
					fontSize: 34,
					fontWeight: 700,
					letterSpacing: 1.2,
					lineHeight: 1,
					whiteSpace: 'nowrap',
				}}
			>
				ALEX MORGAN
			</Interactive.Div>
			<Interactive.Div
				cropRight={interpolate(frame, [4, 24, 92, 112], [1, 0, 0, 1], {
					easing: [
						Easing.bezier(0.65, 0, 0.35, 1),
						Easing.linear,
						Easing.bezier(0.65, 0, 0.35, 1),
					],
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				name="Title bar"
				style={{
					display: 'flex',
					alignItems: 'center',
					width: 534,
					height: 66,
					boxSizing: 'border-box',
					padding: '0 24px',
					overflow: 'hidden',
					backgroundColor: '#18181b',
					color: '#ffffff',
					fontSize: 34,
					fontWeight: 500,
					letterSpacing: 1.2,
					lineHeight: 1,
					whiteSpace: 'nowrap',
				}}
			>
				CREATIVE DEVELOPER
			</Interactive.Div>
		</Interactive.Div>
	);
};
