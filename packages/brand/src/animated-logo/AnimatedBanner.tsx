import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AnimatedLogo} from './AnimatedLogo';

export const AnimatedBanner: React.FC<{
	readonly theme: 'light' | 'dark';
}> = ({theme}) => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: theme === 'light' ? '#fff' : '#202930',
			}}
		>
			<AnimatedLogo theme={theme} />
		</AbsoluteFill>
	);
};
