import {useState} from 'react';
import {AbsoluteFill, random} from 'remotion';
import type {TransitionPresentation} from '../types';

const width = 1;
const height = 1;

const makePathIn = (progress: number) => {
	return `
M 0 0
L ${progress * width * 2} 0
L ${0} ${height * 2 * progress}
Z`.trim();
};

const makePathOut = (progress: number) => {
	return `
M ${width} ${height}
L ${width - 2 * progress * width} ${height}
L ${width} ${height - 2 * progress * height}
Z
`.trim();
};

export const WipePresentation: TransitionPresentation = ({
	children,
	progress,
	direction,
}) => {
	const [clipId] = useState(() => String(random(null)));

	const progressInDirection = direction === 'in' ? progress : 1 - progress;

	const path =
		direction === 'in'
			? makePathIn(progressInDirection)
			: makePathOut(progressInDirection);

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
