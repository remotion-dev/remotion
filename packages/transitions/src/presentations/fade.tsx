import {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import type {HtmlInCanvasShader} from '../html-in-canvas-presentation';
import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '../types.js';

export type FadeProps = {
	enterStyle?: React.CSSProperties;
	exitStyle?: React.CSSProperties;
	shouldFadeOutExitingScene?: boolean;
};

const fadeCanvas: HtmlInCanvasShader<FadeProps> = (canvas) => {
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Failed to create fade canvas context');
	}

	return {
		clear: () => context.reset(),
		cleanup: () => context.reset(),
		draw: ({prevImage, nextImage, width, height, time, passedProps}) => {
			context.reset();
			const progress = Math.max(0, Math.min(1, time));
			context.globalAlpha = passedProps.shouldFadeOutExitingScene
				? 1 - progress
				: 1;
			if (nextImage) {
				context.drawImage(nextImage, 0, 0, width, height);
			}

			context.globalAlpha = progress;
			if (prevImage) {
				context.drawImage(prevImage, 0, 0, width, height);
			}
		},
	};
};

const FadePresentation: React.FC<
	TransitionPresentationComponentProps<FadeProps>
> = ({children, presentationDirection, presentationProgress, passedProps}) => {
	const isEntering = presentationDirection === 'entering';
	const style: React.CSSProperties = useMemo(() => {
		return {
			opacity: isEntering
				? presentationProgress
				: passedProps.shouldFadeOutExitingScene
					? 1 - presentationProgress
					: 1,
			...(presentationDirection === 'entering'
				? passedProps.enterStyle
				: passedProps.exitStyle),
		};
	}, [
		isEntering,
		passedProps.enterStyle,
		passedProps.exitStyle,
		passedProps.shouldFadeOutExitingScene,
		presentationDirection,
		presentationProgress,
	]);

	return (
		<AbsoluteFill showInTimeline={false} style={style}>
			{children}
		</AbsoluteFill>
	);
};
/*
 * @description Provides a simple fade transition component for sliding elements in and out.
 * @see [Documentation](https://www.remotion.dev/docs/transitions/presentations/fade)
 */

export const fade = (props?: FadeProps): TransitionPresentation<FadeProps> => {
	return {
		component: FadePresentation,
		props: props ?? {},
		...(props?.enterStyle || props?.exitStyle ? {} : {canvas: fadeCanvas}),
	};
};
