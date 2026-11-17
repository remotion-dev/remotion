// SPDX-License-Identifier: MIT
// See ../../LICENSE.cube.md for attribution and license terms.
import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import type {HtmlInCanvasShader} from '../html-in-canvas-presentation';
import type {
	TransitionPresentationComponentProps,
	TransitionPresentation,
} from '../types.js';
import {makeThreeDimensionalSceneRenderer} from './three-dimensional-scene';

export type CubeDirection =
	| 'from-left'
	| 'from-right'
	| 'from-top'
	| 'from-bottom';

export type CubeProps = {
	direction: CubeDirection;
	perspective?: number;
};

const cubeCanvas: HtmlInCanvasShader<CubeProps> = (canvas) => {
	const renderer = makeThreeDimensionalSceneRenderer(canvas);
	return {
		clear: renderer.clear,
		cleanup: renderer.cleanup,
		draw: ({
			prevImage,
			nextImage,
			width,
			height,
			time,
			pixelRatio,
			passedProps: {direction, perspective = 1000},
		}) => {
			renderer.clear();
			const vertical = direction === 'from-top' || direction === 'from-bottom';
			const rotationSign =
				direction === 'from-right' || direction === 'from-top' ? 1 : -1;
			const translationSign =
				direction === 'from-right' || direction === 'from-bottom' ? 1 : -1;
			const incomingOriginX = vertical
				? 0.5
				: direction === 'from-left'
					? 1
					: 0;
			const incomingOriginY = vertical
				? direction === 'from-top'
					? 1
					: 0
				: 0.5;
			for (const [image, entering] of [
				[nextImage, false],
				[prevImage, true],
			] as const) {
				if (!image) {
					continue;
				}

				renderer.draw({
					image,
					width,
					height,
					vertical,
					angle: (entering ? 1 - time : -time) * rotationSign * (Math.PI / 2),
					originX: entering ? incomingOriginX : 1 - incomingOriginX,
					originY: entering ? incomingOriginY : 1 - incomingOriginY,
					translation: (entering ? 1 - time : -time) * translationSign,
					perspective: Math.max(1, perspective) * pixelRatio,
				});
			}
		},
	};
};

const Cube: React.FC<TransitionPresentationComponentProps<CubeProps>> = ({
	children,
	presentationDirection,
	presentationProgress,
	passedProps: {perspective = 1000, ...passedProps},
}) => {
	const style: React.CSSProperties = useMemo(() => {
		const startRotationEntering =
			passedProps.direction === 'from-right' ||
			passedProps.direction === 'from-top'
				? 90
				: -90;
		const endRotationEntering =
			passedProps.direction === 'from-right' ||
			passedProps.direction === 'from-top'
				? -90
				: 90;

		const startPositionEntering =
			passedProps.direction === 'from-right' ||
			passedProps.direction === 'from-bottom'
				? 100
				: -100;
		const startPositionExiting =
			passedProps.direction === 'from-right' ||
			passedProps.direction === 'from-bottom'
				? -100
				: 100;

		const transformOriginEntering =
			passedProps.direction === 'from-left'
				? 'right'
				: passedProps.direction === 'from-bottom'
					? 'top'
					: passedProps.direction === 'from-top'
						? 'bottom'
						: 'left';
		const transformOriginExiting =
			passedProps.direction === 'from-left'
				? 'left'
				: passedProps.direction === 'from-bottom'
					? 'bottom'
					: passedProps.direction === 'from-top'
						? 'top'
						: 'right';

		const rotation =
			presentationDirection === 'entering'
				? interpolate(presentationProgress, [0, 1], [startRotationEntering, 0])
				: interpolate(presentationProgress, [0, 1], [0, endRotationEntering]);

		const transformOrigin =
			presentationDirection === 'entering'
				? transformOriginEntering
				: transformOriginExiting;

		const translate = `${
			presentationDirection === 'entering'
				? interpolate(presentationProgress, [0, 1], [startPositionEntering, 0])
				: interpolate(presentationProgress, [0, 1], [0, startPositionExiting])
		}%`;

		const translateProperty =
			passedProps.direction === 'from-top' ||
			passedProps.direction === 'from-bottom'
				? 'translateY'
				: 'translateX';
		const rotateProperty =
			passedProps.direction === 'from-top' ||
			passedProps.direction === 'from-bottom'
				? 'rotateX'
				: 'rotateY';

		return {
			width: '100%',
			height: '100%',
			transformOrigin,
			transform: `${translateProperty}(${translate}) ${rotateProperty}(${rotation}deg)`,
			backfaceVisibility: 'hidden',
			WebkitBackfaceVisibility: 'hidden',
		};
	}, [passedProps.direction, presentationDirection, presentationProgress]);

	return (
		<AbsoluteFill
			showInTimeline={false}
			style={{
				perspective,
				transformStyle: 'preserve-3d',
			}}
		>
			<AbsoluteFill showInTimeline={false} style={style}>
				{children}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/**
 * @description Rotates the entering and exiting scenes as faces of a 3D cube.
 * @see [Documentation](https://www.remotion.dev/docs/transitions/presentations/cube)
 */
export const cube = (props: CubeProps): TransitionPresentation<CubeProps> => {
	return {component: Cube, props, canvas: cubeCanvas};
};
