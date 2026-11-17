import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import type {HtmlInCanvasShader} from '../html-in-canvas-presentation';
import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '../types';

export type NoneProps = {
	enterStyle?: React.CSSProperties;
	exitStyle?: React.CSSProperties;
};

const noneCanvas: HtmlInCanvasShader<NoneProps> = (canvas) => {
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Failed to create none canvas context');
	}

	return {
		clear: () => context.reset(),
		cleanup: () => context.reset(),
		draw: ({prevImage, nextImage, width, height}) => {
			context.reset();
			if (nextImage) {
				context.drawImage(nextImage, 0, 0, width, height);
			}

			if (prevImage) {
				context.drawImage(prevImage, 0, 0, width, height);
			}
		},
	};
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

	return (
		<AbsoluteFill showInTimeline={false} style={style}>
			{children}
		</AbsoluteFill>
	);
};

/*
 * @description A presentation that has no visual effect on its own. Instead, you control the visual effect by using the useTransitionProgress() hook.
 * @see [Documentation](https://www.remotion.dev/docs/transitions/presentations/none)
 */
export const none = (props?: NoneProps): TransitionPresentation<NoneProps> => {
	return {
		component: NonePresentation,
		props: props ?? {},
		...(props?.enterStyle || props?.exitStyle ? {} : {canvas: noneCanvas}),
	};
};
