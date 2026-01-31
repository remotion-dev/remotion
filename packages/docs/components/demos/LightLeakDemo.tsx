import {LightLeak} from '@remotion/light-leaks';
import React from 'react';
import {AbsoluteFill} from 'remotion';

interface Props {
	readonly seed: number;
	readonly hueShift: number;
}

export const LightLeakDemoComp: React.FC<Props> = ({seed, hueShift}) => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<LightLeak seed={seed} hueShift={hueShift} />
		</AbsoluteFill>
	);
};
