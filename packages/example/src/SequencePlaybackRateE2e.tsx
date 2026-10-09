import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';

const Clock: React.FC = () => {
	const frame = useCurrentFrame();
	return <div style={{color: 'white', fontSize: 70}}>Local frame: {frame}</div>;
};

const RetimedChild: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<Sequence
			name="Retimed child"
			from={20}
			durationInFrames={100}
			trimBefore={4}
			playbackRate={0.5}
			style={{rotate: interpolate(frame, [20, 80], ['0deg', '30deg'])}}
		>
			<Clock />
		</Sequence>
	);
};

export const SequencePlaybackRateE2e: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#202020'}}>
			<Sequence
				name="Double speed parent"
				from={10}
				durationInFrames={110}
				playbackRate={2}
			>
				<RetimedChild />
			</Sequence>
		</AbsoluteFill>
	);
};
