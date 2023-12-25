import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '../types.js';

export type FlipDirection =
	| 'from-left'
	| 'from-right'
	| 'from-top'
	| 'from-bottom';

export type FlipProps = {
	direction?: FlipDirection;
	perspective?: number;
};

const Flip: React.FC<TransitionPresentationComponentProps<FlipProps>> = ({
	children,
	presentationDirection,
	presentationProgress,
	passedProps: {direction = 'from-left', perspective = 1000},
}) => {
	const style: React.CSSProperties = useMemo(() => {
		const startRotationEntering =
			direction === 'from-right' || direction === 'from-top' ? 180 : -180;
		const endRotationEntering =
			direction === 'from-right' || direction === 'from-top' ? -180 : 180;

		const rotation =
			presentationDirection === 'entering'
				? interpolate(presentationProgress, [0, 1], [startRotationEntering, 0])
				: interpolate(presentationProgress, [0, 1], [0, endRotationEntering]);

		const rotateProperty =
			direction === 'from-top' || direction === 'from-bottom'
				? 'rotateX'
				: 'rotateY';

		return {
			width: '100%',
			height: '100%',
			transform: `${rotateProperty}(${rotation}deg)`,
			backfaceVisibility: 'hidden',
			WebkitBackfaceVisibility: 'hidden',
		};
	}, [direction, presentationDirection, presentationProgress]);

	const outer: React.CSSProperties = useMemo(() => {
		return {
			perspective,
			// Make children also their backface hidden
			transformStyle: 'preserve-3d',
		};
	}, [perspective]);

	return (
		<AbsoluteFill style={outer}>
			<AbsoluteFill style={style}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const flip = (props?: FlipProps): TransitionPresentation<FlipProps> => {
	return {component: Flip, props: props ?? {}};
};
