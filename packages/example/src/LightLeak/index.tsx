import {LightLeak} from '@remotion/light-leaks';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const LightLeakExample: React.FC = () => {
	return (
		<AbsoluteFill>
			<LightLeak durationInFrames={60}>
				<AbsoluteFill
					style={{backgroundColor: 'white', justifyContent: 'center', alignItems: 'center'}}
				>
					<h1 style={{fontSize: 60}}>Light Leak Effect</h1>
				</AbsoluteFill>
			</LightLeak>
		</AbsoluteFill>
	);
};
