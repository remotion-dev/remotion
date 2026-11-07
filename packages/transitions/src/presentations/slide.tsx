import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import type {HtmlInCanvasShader} from '../html-in-canvas-presentation';
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

const epsilon = 0.01;

const slideCanvas: HtmlInCanvasShader<SlideProps> = (canvas) => {
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Failed to create slide canvas context');
	}

	return {
		clear: () => context.reset(),
		cleanup: () => context.reset(),
		draw: ({prevImage, nextImage, width, height, time, passedProps}) => {
			context.reset();
			const {direction = 'from-left'} = passedProps;
			const corrected = time === 1 ? time : time - epsilon / 100;
			let outgoingX = 0;
			let outgoingY = 0;
			let incomingX = 0;
			let incomingY = 0;
			switch (direction) {
				case 'from-left':
					outgoingX = corrected * width;
					incomingX = (time - 1) * width;
					break;
				case 'from-right':
					outgoingX = -time * width;
					incomingX = (1 - corrected) * width;
					break;
				case 'from-top':
					outgoingY = corrected * height;
					incomingY = (time - 1) * height;
					break;
				case 'from-bottom':
					outgoingY = -time * height;
					incomingY = (1 - corrected) * height;
					break;
				default:
					throw new Error(`Invalid direction: ${direction}`);
			}

			// TransitionSeries supplies the entering scene as prevImage.
			if (nextImage) {
				context.drawImage(nextImage, outgoingX, outgoingY, width, height);
			}

			if (prevImage) {
				context.drawImage(prevImage, incomingX, incomingY, width, height);
			}
		},
	};
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
		// Overlay the two slides barely to avoid a white line between them
		// Remove the correction once the presentation progress is 1
		const presentationProgressWithEpsilonCorrection =
			presentationProgress === 1
				? presentationProgress * 100
				: presentationProgress * 100 - epsilon;

		if (presentationDirection === 'exiting') {
			switch (direction) {
				case 'from-left':
					return {
						transform: `translateX(${presentationProgressWithEpsilonCorrection}%)`,
					};
				case 'from-right':
					return {
						transform: `translateX(${-presentationProgress * 100}%)`,
					};
				case 'from-top':
					return {
						transform: `translateY(${presentationProgressWithEpsilonCorrection}%)`,
					};
				case 'from-bottom':
					return {
						transform: `translateY(${-presentationProgress * 100}%)`,
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
					transform: `translateX(${
						100 - presentationProgressWithEpsilonCorrection
					}%)`,
				};
			case 'from-top':
				return {
					transform: `translateY(${-100 + presentationProgress * 100}%)`,
				};
			case 'from-bottom':
				return {
					transform: `translateY(${
						100 - presentationProgressWithEpsilonCorrection
					}%)`,
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

	return (
		<AbsoluteFill showInTimeline={false} style={style}>
			{children}
		</AbsoluteFill>
	);
};

/*
 * @description Implements a sliding transition for presentation components where the entering slide pushes the outgoing slide in a specified direction.
 * @see [Documentation](https://www.remotion.dev/docs/transitions/presentations/slide)
 */
export const slide = (
	props?: SlideProps,
): TransitionPresentation<SlideProps> => {
	return {
		component: SlidePresentation,
		props: props ?? {},
		...(props?.enterStyle || props?.exitStyle ? {} : {canvas: slideCanvas}),
	};
};
