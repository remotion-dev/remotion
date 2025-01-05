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
	outerEnterStyle?: React.CSSProperties;
	outerExitStyle?: React.CSSProperties;
	innerEnterStyle?: React.CSSProperties;
	innerExitStyle?: React.CSSProperties;
};

const Flip: React.FC<TransitionPresentationComponentProps<FlipProps>> = ({
	children,
	presentationDirection,
	presentationProgress,
	passedProps: {
		direction = 'from-left',
		perspective = 1000,
		innerEnterStyle,
		innerExitStyle,
		outerEnterStyle,
		outerExitStyle,
	},
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
			...(presentationDirection === 'entering'
				? innerEnterStyle
				: innerExitStyle),
		};
	}, [
		direction,
		innerEnterStyle,
		innerExitStyle,
		presentationDirection,
		presentationProgress,
	]);

	const outer: React.CSSProperties = useMemo(() => {
		return {
			perspective,
			// Make children also their backface hidden
			transformStyle: 'preserve-3d',
			...(presentationDirection === 'entering'
				? outerEnterStyle
				: outerExitStyle),
		};
	}, [outerEnterStyle, outerExitStyle, perspective, presentationDirection]);

	return (
		<AbsoluteFill style={outer}>
			<AbsoluteFill style={style}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};
/*
 * @description A presentation where the exiting slide flips by 180 degrees, revealing the next slide on the back side.
 * @see [Documentation](https://www.remotion.dev/docs/transitions/presentations/flip)
 */

export const flip = (props?: FlipProps): TransitionPresentation<FlipProps> => {
	return {component: Flip, props: props ?? {}};
};
