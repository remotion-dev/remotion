import {loadFont} from '@remotion/google-fonts/Inter';
import React from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['500', '600'],
});

export const SourceCreditTag: React.FC = () => {
	const frame = useCurrentFrame();

	const enter = interpolate(frame, [0, 16], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});

	return (
		<Interactive.Div
			name="Container"
			style={{
				display: 'inline-flex',
				alignItems: 'baseline',
				gap: 8,
				boxSizing: 'border-box',
				padding: '8px 12px',
				borderRadius: 8,
				fontFamily: 'Inter',
				backgroundColor: 'rgba(24, 24, 27, 0.72)',
				border: '1px solid rgba(255, 255, 255, 0.1)',
				color: '#fafafa',
				opacity: enter,
				transform: `translateY(${(1 - enter) * 8}px)`,
				backdropFilter: 'blur(8px)',
			}}
		>
			<Interactive.Div
				name="Prefix"
				style={{
					fontSize: 16,
					fontWeight: 500,
					lineHeight: 1.2,
					color: '#a1a1aa',
				}}
			>
				Source:
			</Interactive.Div>
			<Interactive.Div
				name="Source"
				style={{
					fontSize: 16,
					fontWeight: 600,
					lineHeight: 1.2,
					color: '#fafafa',
				}}
			>
				NASA
			</Interactive.Div>
		</Interactive.Div>
	);
};
