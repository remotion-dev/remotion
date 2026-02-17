import {LightLeak} from '@remotion/light-leaks';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const LightLeakExample: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<LightLeak durationInFrames={60} seed={3} hueShift={30} />
		</AbsoluteFill>
	);
};
