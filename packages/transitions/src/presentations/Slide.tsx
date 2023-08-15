import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '../types';

type WipeDirection = 'from-left' | 'from-top' | 'from-right' | 'from-bottom';

type SlideProps = {
	direction: WipeDirection;
};

const SlidePresentation: React.FC<
	TransitionPresentationComponentProps<SlideProps>
> = ({
	children,
	presentationProgress,
	presentationDirection,
	passedProps: {direction: slideDirection},
}) => {
	const progressInDirection =
		presentationDirection === 'in'
			? presentationProgress
			: 1 - presentationProgress;

	const directionStyle = useMemo((): React.CSSProperties => {
		switch (slideDirection) {
			case 'from-left':
				return {
					transform: `translateX(${progressInDirection * 100}%)`,
				};
			case 'from-right':
				return {
					transform: `translateX(-${progressInDirection * 100}%)`,
				};
			case 'from-top':
				return {
					transform: `translateY(${progressInDirection * 100}%)`,
				};
			case 'from-bottom':
				return {
					transform: `translateY(-${progressInDirection * 100}%)`,
				};
			default:
				throw new Error(`Invalid direction: ${slideDirection}`);
		}
	}, [progressInDirection, slideDirection]);

	const style: React.CSSProperties = useMemo(() => {
		return {
			width: '100%',
			height: '100%',
			justifyContent: 'center',
			alignItems: 'center',
			...directionStyle,
		};
	}, [directionStyle]);

	return (
		<AbsoluteFill>
			<AbsoluteFill style={style}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const makeSlidePresentation = (
	props: SlideProps
): TransitionPresentation<SlideProps> => {
	return {
		component: SlidePresentation,
		props,
	};
};
