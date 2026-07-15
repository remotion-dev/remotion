import {Box} from '@remotion/rough-notation';
import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {containerStyle, fontFamily} from './shared';

export const RoughNotationBox: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={containerStyle}>
			<Interactive.Div
				style={{
					fontSize: 80,
					fontWeight: 700,
					lineHeight: 1.1,
					color: '#171717',
					fontFamily,
					width: 800,
					textAlign: 'center',
				}}
			>
				<Interactive.Span>Think outside the </Interactive.Span>
				<Box
					name="Box annotation"
					progress={interpolate(frame, [0, 23], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
					color={'#fe0000'}
					strokeWidth={8}
					iterations={1}
					padding={{
						left: 3,
						right: 6,
						top: -12,
						bottom: -5,
					}}
					roughness={0.9}
				>
					box
				</Box>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
