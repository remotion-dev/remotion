import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '../types.js';

export type SlideDirection =
	| 'from-left'
	| 'from-top'
	| 'from-right'
	| 'from-bottom';

export type SlideProps = {
	direction?: SlideDirection;
	exitStyle?: React.CSSProperties;
	enterStyle?: React.CSSProperties;
};

const SlidePresentation: React.FC<
	TransitionPresentationComponentProps<SlideProps>
> = ({
	children,
	presentationProgress,
	presentationDirection,
	passedProps: {direction = 'from-left', enterStyle, exitStyle},
}) => {
	const directionStyle = useMemo((): React.CSSProperties => {
		if (presentationDirection === 'exiting') {
			switch (direction) {
				case 'from-left':
					return {
						transform: `translateX(${presentationProgress * 100}%)`,
					};
				case 'from-right':
					return {
						transform: `translateX(-${presentationProgress * 100}%)`,
					};
				case 'from-top':
					return {
						transform: `translateY(${presentationProgress * 100}%)`,
					};
				case 'from-bottom':
					return {
						transform: `translateY(-${presentationProgress * 100}%)`,
					};
				default:
					throw new Error(`Invalid direction: ${direction}`);
			}
		}

		switch (direction) {
			case 'from-left':
				return {
					transform: `translateX(${-100 + presentationProgress * 100}%)`,
				};
			case 'from-right':
				return {
					transform: `translateX(${100 - presentationProgress * 100}%)`,
				};
			case 'from-top':
				return {
					transform: `translateY(${-100 + presentationProgress * 100}%)`,
				};
			case 'from-bottom':
				return {
					transform: `translateY(${100 - presentationProgress * 100}%)`,
				};
			default:
				throw new Error(`Invalid direction: ${direction}`);
		}
	}, [presentationDirection, presentationProgress, direction]);

	const style: React.CSSProperties = useMemo(() => {
		return {
			width: '100%',
			height: '100%',
			justifyContent: 'center',
			alignItems: 'center',
			...directionStyle,
			...(presentationDirection === 'entering' ? enterStyle : exitStyle),
		};
	}, [directionStyle, enterStyle, exitStyle, presentationDirection]);

	return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

export const slide = (
	props?: SlideProps,
): TransitionPresentation<SlideProps> => {
	return {
		component: SlidePresentation,
		props: props ?? {},
	};
};
