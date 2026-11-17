import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import type {HtmlInCanvasShader} from '../html-in-canvas-presentation';
import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '../types.js';

const makePolygonIn = (progress: number, direction: WipeDirection) => {
	const p = progress * 100;
	switch (direction) {
		case 'from-left':
			return [
				[0, 0],
				[p, 0],
				[p, 100],
				[0, 100],
			];
		case 'from-top-left':
			return [
				[0, 0],
				[p * 2, 0],
				[0, p * 2],
			];
		case 'from-top':
			return [
				[0, 0],
				[100, 0],
				[100, p],
				[0, p],
			];
		case 'from-top-right':
			return [
				[100, 0],
				[100 - p * 2, 0],
				[100, p * 2],
			];
		case 'from-right':
			return [
				[100, 0],
				[100, 100],
				[100 - p, 100],
				[100 - p, 0],
			];
		case 'from-bottom-right':
			return [
				[100, 100],
				[100 - p * 2, 100],
				[100, 100 - p * 2],
			];
		case 'from-bottom':
			return [
				[0, 100],
				[100, 100],
				[100, 100 - p],
				[0, 100 - p],
			];
		case 'from-bottom-left':
			return [
				[0, 100],
				[0, 100 - p * 2],
				[p * 2, 100],
			];
		default:
			throw new Error(`Unknown direction ${JSON.stringify(direction)}`);
	}
};

const makePolygonOut = (progress: number, direction: WipeDirection) => {
	const p = progress * 100;
	switch (direction) {
		case 'from-left':
			return [
				[100, 100],
				[100 - p, 100],
				[100 - p, 0],
				[100, 0],
			];
		case 'from-top-left':
			return [
				[100, 100],
				[100 - p * 2, 100],
				[100, 100 - p * 2],
			];
		case 'from-top':
			return [
				[100, 100],
				[0, 100],
				[0, 100 - p],
				[100, 100 - p],
			];
		case 'from-top-right':
			return [
				[0, 100],
				[p * 2, 100],
				[0, 100 - p * 2],
			];
		case 'from-right':
			return [
				[0, 0],
				[p, 0],
				[p, 100],
				[0, 100],
			];
		case 'from-bottom-right':
			return [
				[0, 0],
				[p * 2, 0],
				[0, p * 2],
			];
		case 'from-bottom':
			return [
				[100, 0],
				[0, 0],
				[0, p],
				[100, p],
			];
		case 'from-bottom-left':
			return [
				[100, 0],
				[100 - p * 2, 0],
				[100, p * 2],
			];
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

const wipeCanvas: HtmlInCanvasShader<WipeProps> = (canvas) => {
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Failed to create wipe canvas context');
	}

	return {
		clear: () => context.reset(),
		cleanup: () => context.reset(),
		draw: ({prevImage, nextImage, width, height, time, passedProps}) => {
			context.reset();
			const direction = passedProps.direction ?? 'from-left';
			for (const [image, polygon] of [
				[nextImage, makePolygonOut(1 - time, direction)],
				[prevImage, makePolygonIn(time, direction)],
			] as const) {
				if (!image) {
					continue;
				}

				context.save();
				context.beginPath();
				for (const [index, [x, y]] of polygon.entries()) {
					if (index === 0) {
						context.moveTo((x / 100) * width, (y / 100) * height);
					} else {
						context.lineTo((x / 100) * width, (y / 100) * height);
					}
				}

				context.closePath();
				context.clip();
				context.drawImage(image, 0, 0, width, height);
				context.restore();
			}
		},
	};
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

	const polygon =
		presentationDirection === 'entering'
			? makePolygonIn(progressInDirection, direction)
			: makePolygonOut(progressInDirection, direction);
	const clipPath = `polygon(${polygon.map(([x, y]) => `${x}% ${y}%`).join(', ')})`;

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
		<AbsoluteFill showInTimeline={false} style={outerStyle}>
			<AbsoluteFill showInTimeline={false} style={style}>
				{children}
			</AbsoluteFill>
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
		...(props?.outerEnterStyle ||
		props?.outerExitStyle ||
		props?.innerEnterStyle ||
		props?.innerExitStyle
			? {}
			: {canvas: wipeCanvas}),
	};
};
