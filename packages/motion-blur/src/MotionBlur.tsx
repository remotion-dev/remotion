import React from 'react';
import { AbsoluteFill, Freeze, useCurrentFrame } from 'remotion';

type MotionBlurProps = {
	children: React.ReactNode;
	iterations: number;
	frameDelay: number;
	opacity: number;
};

export const MotionBlur: React.FC<MotionBlurProps> = ({
	children,
	iterations,
	frameDelay,
	opacity
}: MotionBlurProps) => {
	const frame = useCurrentFrame();
	return (
		<>
			{new Array(iterations).fill(true).map((_, i) => {
				return (
					<AbsoluteFill
						key={`frame-${i.toString()}`}
						style={{ opacity: opacity - ((i + 1) / iterations) * opacity }}
					>
						<Freeze frame={frame - frameDelay * i}>{children}</Freeze>
					</AbsoluteFill>
				);
			})}
			{children}
		</>
	);
};
