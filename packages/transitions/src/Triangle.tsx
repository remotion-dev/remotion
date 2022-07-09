import React, {useRef, useState} from 'react';
import {AbsoluteFill, random} from 'remotion';
import type {TransitionDirection} from './transition-direction';

export const TriangleTransition: React.FC<{
	progress: number;
	children: React.ReactNode;
	direction: TransitionDirection;
}> = ({children, progress, direction}) => {
	const ref = useRef<SVGSVGElement>(null);
	const width = 1;
	const height = 1;
	const [clipId] = useState(() => String(random(null)));

	const progressInDirection = direction === 'in' ? progress : 1 - progress;

	const pathIn = `
	M 0 0
	L ${progressInDirection * width * 2} 0
	L ${0} ${height * 2 * progressInDirection}
	Z`;

	const pathOut = `
	M ${width} ${height}
	L ${width - 2 * progressInDirection * width} ${height}
	L ${width} ${height - 2 * progressInDirection * height}
	Z
	`;

	const path = direction === 'in' ? pathIn : pathOut;

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
					ref={ref}
					viewBox={`0 0 ${width} ${height}`}
					style={{
						width: '100%',
						height: '100%',
					}}
				>
					<defs>
						<clipPath id={clipId} clipPathUnits="objectBoundingBox">
							<path d={path} fill="red" />
						</clipPath>
					</defs>
				</svg>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
