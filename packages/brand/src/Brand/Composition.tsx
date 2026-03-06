import React from 'react';
import {AbsoluteFill} from 'remotion';
import {All} from './All';
import {getBackground} from './colors';

export const Comp: React.FC<{
	theme: 'light' | 'dark';
}> = ({theme}) => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: getBackground(theme),
			}}
		>
			<AbsoluteFill
				style={{
					transform: `scale(0.7)`,
					overflowY: 'hidden',
				}}
			>
				<All theme={theme} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
