import React, {useState} from 'react';
import {AbsoluteFill, random} from 'remotion';
import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '../types';

const width = 1;
const height = 1;

type WipeDirection = 'left' | 'top-left';
type WipeProps = {
	direction: WipeDirection;
};

const makePathIn = (progress: number, direction: WipeDirection) => {
	if (direction === 'left') {
		return `
	M 0 0
	L ${progress * width} 0
	L ${progress * width} ${height}
	L ${0} ${height}
	Z`;
	}

	return `
M 0 0
L ${progress * width * 2} 0
L ${0} ${height * 2 * progress}
Z`.trim();
};

const makePathOut = (progress: number, direction: WipeDirection) => {
	if (direction === 'left') {
		return `
	M ${width} ${height}
	L ${width - progress * width} ${height}
	L ${width - progress * width} ${0}
	L ${width} ${0}
	Z
	`;
	}

	return `
M ${width} ${height}
L ${width - 2 * progress * width} ${height}
L ${width} ${height - 2 * progress * height}
Z
`.trim();
};

export const WipePresentation: React.FC<
	TransitionPresentationComponentProps<WipeProps>
> = ({
	children,
	presentationProgress,
	presentationDirection,
	passedProps: {direction: wipeDirection},
}) => {
	const [clipId] = useState(() => String(random(null)));

	const progressInDirection =
		presentationDirection === 'in'
			? presentationProgress
			: 1 - presentationProgress;

	const path =
		presentationDirection === 'in'
			? makePathIn(progressInDirection, wipeDirection)
			: makePathOut(progressInDirection, wipeDirection);

	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					width: '100%',
					height: '100%',
					justifyContent: 'center',
					alignItems: 'center',
					clipPath: `url(#${clipId})`,
				}}
			>
				{children}
			</AbsoluteFill>
			<AbsoluteFill>
				<svg
					viewBox={`0 0 ${width} ${height}`}
					style={{
						width: '100%',
						height: '100%',
					}}
				>
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

export const makeWipePresentation = (
	direction: WipeDirection
): TransitionPresentation<WipeProps> => {
	return {
		component: WipePresentation,
		props: {direction},
	};
};
