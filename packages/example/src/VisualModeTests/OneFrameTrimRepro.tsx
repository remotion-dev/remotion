import React from 'react';
import {
	AbsoluteFill,
	Sequence,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const Child: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	return (
		<div
			style={{
				opacity: interpolate(frame, [0, durationInFrames - 1], [0, 1]),
			}}
		>
			Child
		</div>
	);
};

export const OneFrameTrimRepro: React.FC = () => (
	<AbsoluteFill
		style={{backgroundColor: '#eee', color: '#111', fontSize: 28, padding: 40}}
	>
		<div>
			Issue #11996: keep the playhead at frame 0 and trim &quot;Trim this
			parent&quot; to one frame. The child&apos;s interpolation becomes [0, 0]
			and throws.
		</div>
		<Sequence name="Trim this parent" durationInFrames={300} layout="none">
			<Child />
		</Sequence>
	</AbsoluteFill>
);
