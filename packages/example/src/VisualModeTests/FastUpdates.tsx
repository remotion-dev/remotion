// This file can be changed through the script: packages/example/fast-updates.ts
import {LightLeak} from '@remotion/light-leaks';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const FastUpdates: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<LightLeak durationInFrames={60} seed={855} hueShift={0} />
		</AbsoluteFill>
	);
};
