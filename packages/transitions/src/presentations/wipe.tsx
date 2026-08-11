import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '../types.js';

const makePolygonIn = (progress: number, direction: WipeDirection) => {
	const p = progress * 100;
	switch (direction) {
		case 'from-left':
			return `polygon(0% 0%, ${p}% 0%, ${p}% 100%, 0% 100%)`;
		case 'from-top-left':
			return `polygon(0% 0%, ${p * 2}% 0%, 0% ${p * 2}%)`;
		case 'from-top':
			return `polygon(0% 0%, 100% 0%, 100% ${p}%, 0% ${p}%)`;
		case 'from-top-right':
			return `polygon(100% 0%, ${100 - p * 2}% 0%, 100% ${p * 2}%)`;
		case 'from-right':
			return `polygon(100% 0%, 100% 100%, ${100 - p}% 100%, ${100 - p}% 0%)`;
		case 'from-bottom-right':
			return `polygon(100% 100%, ${100 - p * 2}% 100%, 100% ${100 - p * 2}%)`;
		case 'from-bottom':
			return `polygon(0% 100%, 100% 100%, 100% ${100 - p}%, 0% ${100 - p}%)`;
		case 'from-bottom-left':
			return `polygon(0% 100%, 0% ${100 - p * 2}%, ${p * 2}% 100%)`;
		default:
			throw new Error(`Unknown direction ${JSON.stringify(direction)}`);
	}
};

const makePolygonOut = (progress: number, direction: WipeDirection) => {
	const p = progress * 100;
	switch (direction) {
		case 'from-left':
			return `polygon(100% 100%, ${100 - p}% 100%, ${100 - p}% 0%, 100% 0%)`;
		case 'from-top-left':
			return `polygon(100% 100%, ${100 - p * 2}% 100%, 100% ${100 - p * 2}%)`;
		case 'from-top':
			return `polygon(100% 100%, 0% 100%, 0% ${100 - p}%, 100% ${100 - p}%)`;
		case 'from-top-right':
			return `polygon(0% 100%, ${p * 2}% 100%, 0% ${100 - p * 2}%)`;
		case 'from-right':
			return `polygon(0% 0%, ${p}% 0%, ${p}% 100%, 0% 100%)`;
		case 'from-bottom-right':
			return `polygon(0% 0%, ${p * 2}% 0%, 0% ${p * 2}%)`;
		case 'from-bottom':
			return `polygon(100% 0%, 0% 0%, 0% ${p}%, 100% ${p}%)`;
		case 'from-bottom-left':
			return `polygon(100% 0%, ${100 - p * 2}% 0%, 100% ${p * 2}%)`;
		default:
			throw new Error(`Unknown direction ${JSON.stringify(direction)}`);
	}
};

export type WipeDirection =
	| 'from-left'
	| 'from-top-left'
	| 'from-top'
	| 'from-top-right'
	| 'from-right'
	| 'from-bottom-right'
	| 'from-bottom'
	| 'from-bottom-left';

export type WipeProps = {
	direction?: WipeDirection;
	outerEnterStyle?: React.CSSProperties;
	outerExitStyle?: React.CSSProperties;
	innerEnterStyle?: React.CSSProperties;
	innerExitStyle?: React.CSSProperties;
};

const WipePresentation: React.FC<
	TransitionPresentationComponentProps<WipeProps>
> = ({
	children,
	presentationProgress,
	presentationDirection,
	passedProps: {
		direction = 'from-left',
		innerEnterStyle,
		innerExitStyle,
		outerEnterStyle,
		outerExitStyle,
	},
}) => {
	const progressInDirection =
		presentationDirection === 'entering'
			? presentationProgress
			: 1 - presentationProgress;

	const clipPath =
		presentationDirection === 'entering'
			? makePolygonIn(progressInDirection, direction)
			: makePolygonOut(progressInDirection, direction);

	const style: React.CSSProperties = useMemo(() => {
		return {
			width: '100%',
			height: '100%',
			justifyContent: 'center',
			alignItems: 'center',
			clipPath,
			...(presentationDirection === 'entering'
				? innerEnterStyle
				: innerExitStyle),
		};
	}, [clipPath, innerEnterStyle, innerExitStyle, presentationDirection]);

	const outerStyle = useMemo(() => {
		return presentationDirection === 'entering'
			? outerEnterStyle
			: outerExitStyle;
	}, [outerEnterStyle, outerExitStyle, presentationDirection]);

	return (
		<AbsoluteFill style={outerStyle}>
			<AbsoluteFill style={style}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};

/*
 * @description A presentation where the entering slide slides over the exiting slide.
 * @see [Documentation](https://www.remotion.dev/docs/transitions/presentations/wipe)
 */
export const wipe = (props?: WipeProps): TransitionPresentation<WipeProps> => {
	return {
		component: WipePresentation,
		props: props ?? {},
	};
};
