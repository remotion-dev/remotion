import {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '../types.js';

export type FadeProps = {
	enterStyle?: React.CSSProperties;
	exitStyle?: React.CSSProperties;
	shouldFadeOutExitingScene?: boolean;
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

	return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};
/*
 * @description Provides a simple fade transition component for sliding elements in and out.
 * @see [Documentation](https://www.remotion.dev/docs/transitions/presentations/fade)
 */

export const fade = (props?: FadeProps): TransitionPresentation<FadeProps> => {
	return {
		component: FadePresentation,
		props: props ?? {},
	};
};
