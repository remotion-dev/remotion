import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {RotateX, RotateY, Scale} from '../3DContext/transformation-context';

export const SpinEffect: React.FC<{
	readonly children: React.ReactNode;
	readonly delay?: number;
}> = ({children, delay}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const jumpIn = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		durationInFrames: 40,
		delay,
	});

	const rotateDown = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		delay: 15 + (delay ?? 0),
		durationInFrames: 40,
	});

	const y = interpolate(jumpIn, [0, 1], [Math.PI * 2, 0]);
	const x = interpolate(rotateDown, [0, 1], [-0.3, 0]);

	return (
		<Scale factor={jumpIn}>
			<RotateX radians={x}>
				<RotateY radians={y}>{children}</RotateY>
			</RotateX>
		</Scale>
	);
};
