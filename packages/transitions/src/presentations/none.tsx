import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '../types';

export type NoneProps = {
	enterStyle?: React.CSSProperties;
	exitStyle?: React.CSSProperties;
};

const NonePresentation: React.FC<
	TransitionPresentationComponentProps<NoneProps>
> = ({children, presentationDirection, passedProps}) => {
	const style: React.CSSProperties = useMemo(() => {
		return {
			...(presentationDirection === 'entering'
				? passedProps.enterStyle
				: passedProps.exitStyle),
		};
	}, [passedProps.enterStyle, passedProps.exitStyle, presentationDirection]);

	return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

/**
 * Wraps the transition in a context so that the progress can be read from the children using a hook.
 * @see [Documentation](https://remotion.dev/docs/transitions/presentations/context)
 * @param {NoneProps} [props] Optional properties to define 'enterStyle' and 'exitStyle'.
 * @returns {TransitionPresentation<NoneProps>} The transition presentation component setup.
 */
export const none = (props?: NoneProps): TransitionPresentation<NoneProps> => {
	return {
		component: NonePresentation,
		props: props ?? {},
	};
};
