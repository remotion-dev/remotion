import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const Issue9170: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: '#0b1020'}}>
			<Sequence
				name="Opacity ending at durationInFrames - 1"
				durationInFrames={durationInFrames}
				style={{
					opacity: interpolate(frame, [0, durationInFrames - 1], [0, 1]),
				}}
			>
				<AbsoluteFill
					style={{
						alignItems: 'center',
						background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
						color: 'white',
						fontFamily: 'sans-serif',
						justifyContent: 'center',
					}}
				>
					<div style={{fontSize: 64, fontWeight: 700}}>Issue #9170</div>
					<div style={{fontFamily: 'monospace', fontSize: 34, marginTop: 24}}>
						[0, durationInFrames - 1]
					</div>
					<div style={{fontSize: 28, marginTop: 18}}>
						Frame {frame} of {durationInFrames - 1}
					</div>
				</AbsoluteFill>
			</Sequence>
		</AbsoluteFill>
	);
};
