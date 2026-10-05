import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '@remotion/transitions';
import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';

export type BlindsProps = {
	readonly count: number;
	readonly width: number;
	readonly height: number;
};

const SPREAD = 0.45;
const ease = Easing.bezier(0.65, 0, 0.35, 1);

// Horizontal slats open from their center line, cascading top to bottom.
const BlindsPresentation: React.FC<
	TransitionPresentationComponentProps<BlindsProps>
> = ({children, presentationDirection, presentationProgress, passedProps}) => {
	if (presentationDirection === 'exiting') {
		return <AbsoluteFill>{children}</AbsoluteFill>;
	}

	const {count, width, height} = passedProps;
	const band = height / count;
	let d = '';
	for (let i = 0; i < count; i++) {
		const start = (i / Math.max(1, count - 1)) * SPREAD;
		const open = interpolate(
			presentationProgress,
			[start, start + (1 - SPREAD)],
			[0, 1],
			{extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease},
		);
		const slat = (band + 1) * open;
		if (slat > 0) {
			const top = i * band + (band - slat) / 2;
			d += `M0 ${top}H${width}V${top + slat}H0Z`;
		}
	}

	return (
		<AbsoluteFill
			style={{clipPath: d === '' ? 'inset(0 0 100% 0)' : `path("${d}")`}}
		>
			{children}
		</AbsoluteFill>
	);
};

export const blinds = (
	props: BlindsProps,
): TransitionPresentation<BlindsProps> => {
	if (!Number.isInteger(props.count) || props.count < 1) {
		throw new TypeError('blinds() needs a positive integer count');
	}

	return {component: BlindsPresentation, props};
};
