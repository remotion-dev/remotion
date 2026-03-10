import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {AnimatedLogo} from './AnimatedLogo';

export const AnimatedMaster: React.FC = () => {
	return (
		<AbsoluteFill>
			<Sequence from={108}>
				<AnimatedLogo theme="light" />
			</Sequence>
		</AbsoluteFill>
	);
};
