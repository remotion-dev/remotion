import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '@remotion/transitions';
import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';

export type SlabWipeProps = {
	readonly colors: readonly string[];
	readonly direction?: 'up' | 'left';
};

const SLANT = 16;
const STAGGER = 0.1;
const TRAVEL = 0.4;
const edgeEase = Easing.bezier(0.83, 0, 0.17, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Position of a slab edge in percent, travelling from fully offscreen to fully past.
const edge = (progress: number, start: number) =>
	interpolate(
		progress,
		[start, start + TRAVEL],
		[100 + SLANT / 2, -SLANT / 2],
		{
			...clamp,
			easing: edgeEase,
		},
	);

const slabPolygon = (lead: number, trail: number, direction: 'up' | 'left') => {
	const half = SLANT / 2;
	if (direction === 'up') {
		return `polygon(0% ${lead - half}%, 100% ${lead + half}%, 100% ${trail + half}%, 0% ${trail - half}%)`;
	}

	return `polygon(${lead + half}% 0%, ${lead - half}% 100%, ${trail - half}% 100%, ${trail + half}% 0%)`;
};

// Colored slabs sweep across and cover the outgoing scene, then sweep away to
// reveal the incoming one.
const SlabWipePresentation: React.FC<
	TransitionPresentationComponentProps<SlabWipeProps>
> = ({children, presentationDirection, presentationProgress, passedProps}) => {
	const {colors, direction = 'up'} = passedProps;
	const count = colors.length;
	const axis = direction === 'up' ? '0 ' : '';
	const suffix = direction === 'up' ? '%' : '% 0';

	if (presentationDirection === 'exiting') {
		const drift = interpolate(presentationProgress, [0, TRAVEL], [0, -7], {
			...clamp,
			easing: Easing.in(Easing.cubic),
		});
		return (
			<AbsoluteFill style={{translate: `${axis}${drift}${suffix}`}}>
				{children}
			</AbsoluteFill>
		);
	}

	const revealStart = 0.5 + (count - 1) * STAGGER;
	const settle = interpolate(
		presentationProgress,
		[revealStart, revealStart + TRAVEL],
		[7, 0],
		{...clamp, easing: Easing.out(Easing.cubic)},
	);

	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					opacity: presentationProgress >= TRAVEL ? 1 : 0,
					translate: `${axis}${settle}${suffix}`,
				}}
			>
				{children}
			</AbsoluteFill>
			{colors.map((color, i) => {
				const lead = edge(presentationProgress, i * STAGGER);
				const trail = edge(
					presentationProgress,
					0.5 + (count - 1 - i) * STAGGER,
				);
				return (
					<AbsoluteFill
						key={`${color}-${i}`}
						style={{
							backgroundColor: color,
							clipPath: slabPolygon(lead, trail, direction),
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

export const slabWipe = (
	props: SlabWipeProps,
): TransitionPresentation<SlabWipeProps> => {
	if (props.colors.length === 0) {
		throw new TypeError('slabWipe() needs at least one color');
	}

	if (0.5 + (props.colors.length - 1) * STAGGER + TRAVEL > 1) {
		throw new TypeError('slabWipe() supports at most two colors');
	}

	return {component: SlabWipePresentation, props};
};
