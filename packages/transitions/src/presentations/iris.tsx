import {translatePath} from '@remotion/paths';
import {makeCircle} from '@remotion/shapes';
import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import type {HtmlInCanvasShader} from '../html-in-canvas-presentation';
import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '../types.js';

export type IrisProps = {
	width: number;
	height: number;
	outerEnterStyle?: React.CSSProperties;
	outerExitStyle?: React.CSSProperties;
	innerEnterStyle?: React.CSSProperties;
	innerExitStyle?: React.CSSProperties;
};

const irisCanvas: HtmlInCanvasShader<IrisProps> = (canvas) => {
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Failed to create iris canvas context');
	}

	return {
		clear: () => context.reset(),
		cleanup: () => context.reset(),
		draw: ({
			prevImage,
			nextImage,
			width,
			height,
			time,
			pixelRatio,
			passedProps,
		}) => {
			context.reset();
			if (nextImage) {
				context.drawImage(nextImage, 0, 0, width, height);
			}

			if (!prevImage) {
				return;
			}

			const radius =
				(Math.sqrt(passedProps.width ** 2 + passedProps.height ** 2) / 2) *
				time;
			const {path} = makeCircle({radius});
			const translatedPath = translatePath(
				path,
				passedProps.width / 2 - radius,
				passedProps.height / 2 - radius,
			);
			context.save();
			context.scale(pixelRatio, pixelRatio);
			context.clip(new Path2D(translatedPath));
			context.drawImage(
				prevImage,
				0,
				0,
				width / pixelRatio,
				height / pixelRatio,
			);
			context.restore();
		},
	};
};

const IrisPresentation: React.FC<
	TransitionPresentationComponentProps<IrisProps>
> = ({children, presentationDirection, presentationProgress, passedProps}) => {
	const maxRadius =
		Math.sqrt(passedProps.width ** 2 + passedProps.height ** 2) / 2;

	const minRadius = 0;
	const currentRadius =
		presentationDirection === 'entering'
			? minRadius + (maxRadius - minRadius) * presentationProgress
			: maxRadius - (maxRadius - minRadius) * presentationProgress;

	const {path} = makeCircle({
		radius: currentRadius,
	});

	const translatedPath = translatePath(
		path,
		passedProps.width / 2 - currentRadius,
		passedProps.height / 2 - currentRadius,
	);

	const style: React.CSSProperties = useMemo(() => {
		return {
			width: '100%',
			height: '100%',
			clipPath:
				presentationDirection === 'exiting'
					? undefined
					: `path("${translatedPath}")`,
			...(presentationDirection === 'entering'
				? passedProps.innerEnterStyle
				: passedProps.innerExitStyle),
		};
	}, [
		translatedPath,
		passedProps.innerEnterStyle,
		passedProps.innerExitStyle,
		presentationDirection,
	]);

	const outerStyle = useMemo(() => {
		return presentationDirection === 'entering'
			? passedProps.outerEnterStyle
			: passedProps.outerExitStyle;
	}, [
		passedProps.outerEnterStyle,
		passedProps.outerExitStyle,
		presentationDirection,
	]);

	return (
		<AbsoluteFill showInTimeline={false} style={outerStyle}>
			<AbsoluteFill showInTimeline={false} style={style}>
				{children}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/*
 * @description Creates an iris transition that uses a circular mask starting from the center to reveal the underlying scene.
 * @see [Documentation](https://www.remotion.dev/docs/transitions/presentations/iris)
 */
export const iris = (props: IrisProps): TransitionPresentation<IrisProps> => {
	return {
		component: IrisPresentation,
		props: props ?? {},
		...(props?.outerEnterStyle ||
		props?.outerExitStyle ||
		props?.innerEnterStyle ||
		props?.innerExitStyle
			? {}
			: {canvas: irisCanvas}),
	};
};
