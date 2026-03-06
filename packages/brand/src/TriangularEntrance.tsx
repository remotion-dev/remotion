import React, {useRef, useState} from 'react';
import {AbsoluteFill, random} from 'remotion';

export const TriangleEntrance: React.FC<{
	progress: number;
	children: React.ReactNode;
	type: 'in' | 'out';
}> = ({children, progress, type}) => {
	const ref = useRef<SVGSVGElement>(null);
	const width = 1;
	const height = 1;
	const [clipId] = useState(() => String(random(null)));

	const progressInDirection = type === 'in' ? progress : 1 - progress;

	const pathIn = `
	M 0 0
	L ${progressInDirection * 2} 0
	L ${0} ${2 * progressInDirection}
	Z`;

	const pathOut = `
	M 1 1
	L ${1 - 2 * progressInDirection} 1
	L ${1} ${1 - 2 * progressInDirection}
	Z
	`;

	const path = type === 'in' ? pathIn : pathOut;

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
