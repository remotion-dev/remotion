import React, {useState} from 'react';
import {AbsoluteFill, random} from 'remotion';
import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '../types';

const width = 1;
const height = 1;

type WipeDirection = 'from-left' | 'from-top-left';
type WipeProps = {
	origin: WipeDirection;
};

const makePathIn = (progress: number, origin: WipeDirection) => {
	if (origin === 'from-left') {
		return `
M 0 0
L ${progress} 0
L ${progress} 1
L 0 1
Z`;
	}

	if (origin === 'from-top-left') {
		return `
M 0 0
L ${progress * 2} 0
L 0 ${height * 2}
Z`.trim();
	}

	throw new Error(`Unknown origin ${JSON.stringify(origin)}`);
};

const makePathOut = (progress: number, origin: WipeDirection) => {
	if (origin === 'from-left') {
		return `
M 1 1
L ${1 - progress} 1
L ${1 - progress} 0
L 1 0
Z
`;
	}

	if (origin === 'from-top-left') {
		return `
M 1 1
L ${1 - 2 * progress} 1
L 1 ${1 - 2 * progress}
Z
`.trim();
	}

	throw new Error(`Unknown origin ${JSON.stringify(origin)}`);
};

export const WipePresentation: React.FC<
	TransitionPresentationComponentProps<WipeProps>
> = ({
	children,
	presentationProgress,
	presentationDirection,
	passedProps: {origin: wipeDirection},
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
	props: WipeProps
): TransitionPresentation<WipeProps> => {
	return {
		component: WipePresentation,
		props,
	};
};
