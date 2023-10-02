import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	Sequence,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const PageTransition: React.FC = () => {
	const transitionAt = 50;
	const {fps, width} = useVideoConfig();
	const frame = useCurrentFrame();

	const transition = spring({
		fps,
		frame,
		delay: transitionAt,
		durationInFrames: 30,
		config: {
			damping: 200,
		},
	});

	const left = interpolate(transition, [0, 1], [width, 0]);

	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					backgroundColor: 'red',
				}}
			>
				Page 1
			</AbsoluteFill>
			<Sequence
				style={{
					backgroundColor: 'yellow',
					transform: `translateX(${left}px)`,
				}}
				from={transitionAt}
			>
				Page 2
			</Sequence>
		</AbsoluteFill>
	);
};
