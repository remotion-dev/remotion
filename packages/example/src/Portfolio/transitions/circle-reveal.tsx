import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '@remotion/transitions';
import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';

export type CircleRevealProps = {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
	readonly ringColor: string;
	readonly ringWidth?: number;
};

const ease = Easing.bezier(0.65, 0, 0.35, 1);

// An iris that opens from any point, with a colored rim on its leading edge.
const CircleRevealPresentation: React.FC<
	TransitionPresentationComponentProps<CircleRevealProps>
> = ({children, presentationDirection, presentationProgress, passedProps}) => {
	const {x, y, width, height, ringColor, ringWidth = 34} = passedProps;
	const progress = ease(presentationProgress);

	if (presentationDirection === 'exiting') {
		return (
			<AbsoluteFill
				style={{scale: 1 + 0.14 * progress, transformOrigin: `${x}px ${y}px`}}
			>
				{children}
			</AbsoluteFill>
		);
	}

	const maxRadius = Math.max(
		Math.hypot(x, y),
		Math.hypot(width - x, y),
		Math.hypot(x, height - y),
		Math.hypot(width - x, height - y),
	);
	const rim = ringWidth * (1 - progress);
	const radius = (maxRadius + ringWidth) * progress;

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{clipPath: `circle(${radius}px at ${x}px ${y}px)`}}>
				{children}
			</AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					left: x - radius - rim,
					top: y - radius - rim,
					width: (radius + rim) * 2,
					height: (radius + rim) * 2,
					borderRadius: '50%',
					border: `${rim}px solid ${ringColor}`,
					boxSizing: 'border-box',
				}}
			/>
		</AbsoluteFill>
	);
};

export const circleReveal = (
	props: CircleRevealProps,
): TransitionPresentation<CircleRevealProps> => {
	return {component: CircleRevealPresentation, props};
};
