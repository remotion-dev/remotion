import React from 'react';
import {interpolate, Sequence, useCurrentFrame} from 'remotion';

export const KeyframedExample: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<Sequence
			from={0}
			durationInFrames={120}
			style={{scale: interpolate(frame, [0, 100], [2, 4])}}
		/>
	);
};
