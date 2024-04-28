import React from 'react';
import {Series, useCurrentFrame} from 'remotion';

const Premounted: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<div style={{background: 'red', height: 100, width: 100}}>{frame}</div>
	);
};

export const Layers: React.FC = () => {
	return (
		<Series>
			<Series.Sequence durationInFrames={40}>hi there</Series.Sequence>
			<Series.Sequence durationInFrames={40}>hi there</Series.Sequence>
			<Series.Sequence premountFor={10} durationInFrames={40}>
				<Premounted />
			</Series.Sequence>
		</Series>
	);
};
