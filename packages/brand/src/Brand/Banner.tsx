import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {Theme} from './colors';
import {Comp} from './Composition';

export const Banner: React.FC<{
	theme: Theme;
}> = ({theme}) => {
	const {height} = useVideoConfig();

	return (
		<AbsoluteFill style={{marginTop: -(1080 - height) / 2}}>
			<Sequence width={1080} height={1080}>
				<Comp theme={theme} />
			</Sequence>
		</AbsoluteFill>
	);
};
