import React, {useMemo, useState} from 'react';
import {AbsoluteFill, random} from 'remotion';
import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '../types.js';

const makePathIn = (progress: number, direction: WipeDirection) => {
	switch (direction) {
		case 'from-left':
			return `
M 0 0
L ${progress} 0
L ${progress} 1
L 0 1
Z`;

		case 'from-top-left':
			return `
M 0 0
L ${progress * 2} 0
L 0 ${progress * 2}
Z`;

		case 'from-top':
			return `
M 0 0
L 1 0
L 1 ${progress}
L 0 ${progress}
Z`;

		case 'from-top-right':
			return `
M 1 0
L ${1 - progress * 2} 0
L 1 ${progress * 2}
Z`;

		case 'from-right':
			return `
M 1 0
L 1 1
L ${1 - progress} 1
L ${1 - progress} 0
Z`;

		case 'from-bottom-right':
			return `
M 1 1
L ${1 - progress * 2} 1
L 1 ${1 - progress * 2}
Z`;

		case 'from-bottom':
			return `
M 0 1
L 1 1
L 1 ${1 - progress}
L 0 ${1 - progress}
Z`;

		case 'from-bottom-left':
			return `
M 0 1
L 0 ${1 - progress * 2}
L ${progress * 2} 1
Z`;

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

const makePathOut = (progress: number, direction: WipeDirection) => {
	switch (direction) {
		case 'from-left':
			return `
M 1 1
L ${1 - progress} 1
L ${1 - progress} 0
L 1 0
Z`;

		case 'from-top-left':
			return `
M 1 1
L ${1 - 2 * progress} 1
L 1 ${1 - 2 * progress}
Z`;

		case 'from-top':
			return `
M 1 1
L 0 1
L 0 ${1 - progress}
L 1 ${1 - progress}
Z`;

		case 'from-top-right':
			return `
M 0 1
L ${progress * 2} 1
L 0 ${1 - progress * 2}
Z`;

		case 'from-right':
			return `
M 0 0
L ${progress} 0
L ${progress} 1
L 0 1
Z`;

		case 'from-bottom-right':
			return `
M 0 0
L ${progress * 2} 0
L 0 ${progress * 2}
Z`;

		case 'from-bottom':
			return `
M 1 0
L 0 0
L 0 ${progress}
L 1 ${progress}
Z`;

		case 'from-bottom-left':
			return `
M 1 0
L ${1 - progress * 2} 0
L 1 ${progress * 2}
Z`;

		default:
			throw new Error(`Unknown direction ${JSON.stringify(direction)}`);
	}
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
	const [clipId] = useState(() => String(random(null)));

	const progressInDirection =
		presentationDirection === 'entering'
			? presentationProgress
			: 1 - presentationProgress;

	const path =
		presentationDirection === 'entering'
			? makePathIn(progressInDirection, direction)
			: makePathOut(progressInDirection, direction);

	const style: React.CSSProperties = useMemo(() => {
		return {
			width: '100%',
			height: '100%',
			justifyContent: 'center',
			alignItems: 'center',
			clipPath: `url(#${clipId})`,
			...(presentationDirection === 'entering'
				? innerEnterStyle
				: innerExitStyle),
		};
	}, [clipId, innerEnterStyle, innerExitStyle, presentationDirection]);

	const outerStyle = useMemo(() => {
		return presentationDirection === 'entering'
			? outerEnterStyle
			: outerExitStyle;
	}, [outerEnterStyle, outerExitStyle, presentationDirection]);

	const svgStyle: React.CSSProperties = useMemo(() => {
		return {
			width: '100%',
			height: '100%',
			pointerEvents: 'none',
		};
	}, []);

	return (
		<AbsoluteFill style={outerStyle}>
			<AbsoluteFill style={style}>{children}</AbsoluteFill>
			<AbsoluteFill>
				<svg viewBox="0 0 1 1" style={svgStyle}>
					<defs>
						<clipPath id={clipId} clipPathUnits="objectBoundingBox">
							<path d={path} fill="black" />
						</clipPath>
					</defs>
				</svg>
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
	};
};
