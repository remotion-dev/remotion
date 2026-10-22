import {loadVariableFont} from '@remotion/google-fonts/NotoSans';
import React from 'react';
import {AbsoluteFill, Interactive} from 'remotion';

const {axes, fontFamily} = loadVariableFont('normal', {
	subsets: ['latin'],
});

export const VariableGoogleFont: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: '#f4f1e8',
				color: '#161616',
				justifyContent: 'center',
			}}
		>
			<div
				style={{
					fontFamily,
					fontSize: 28,
					fontWeight: 500,
					letterSpacing: 4,
					marginTop: 56,
				}}
			>
				FONT WEIGHT {axes.wght.min}–{axes.wght.max}
			</div>
			<Interactive.Div
				name="Variable font weight"
				style={{
					fontFamily,
					fontSize: 150,
					fontWeight: 100,
					letterSpacing: -7,
					lineHeight: 1,
				}}
			>
				Variable
			</Interactive.Div>
		</AbsoluteFill>
	);
};
