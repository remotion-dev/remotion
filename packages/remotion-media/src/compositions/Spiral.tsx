import {parsePath, resetPath} from '@remotion/paths';
import {makeTriangle} from '@remotion/shapes';
import React from 'react';
import {
	AbsoluteFill,
	interpolateColors,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {centerPath} from './center';
import {ColorBars} from './ColorBars';
import {BLUE} from './colors';
import {transformElement} from './element';
import {Faces} from './Faces';
import {FrameCounter} from './FrameCounter';
import {extrudeElement} from './join-inbetween-tiles';
import {
	rotateX,
	rotateY,
	rotateZ,
	translateX,
	translateY,
	translateZ,
} from './matrix';

export const Spiral: React.FC = () => {
	const frame = (Math.sin(useCurrentFrame() / 50) + 1) * 50 + 400;
	const {height, width} = useVideoConfig();
	const viewBox = [-width / 2, -height / 2, width, height];

	const triangle = makeTriangle({
		direction: 'right',
		length: 300,
		edgeRoundness: 0.71,
	});

	const items = new Array(8).fill(true).map((item, i) => {
		const color = interpolateColors(i, [0, 8], ['#E9F3FD', BLUE]);
		const cursor = transformElement(
			extrudeElement({
				depth: 30,
				backFaceColor: color,
				frontFaceColor: color,
				points: parsePath(centerPath(resetPath(triangle.path))),
				sideColor: '#000',
				strokeWidth: 10,
				description: 'Cursor',
				strokeColor: '#000',
				crispEdges: true,
			}),
			[
				rotateZ((frame - i * 3) / 90),
				rotateY(Math.PI / 4),
				rotateY(Math.sin(i * 0.03) * Math.PI + frame / 300),
				rotateX(Math.cos(i * 0.03) * Math.PI + (frame - i * 30) / 150),
				translateX(Math.sin(i * 0.03) * 3000),
				translateZ(Math.sin(i * 0.03) * 6000),
				translateY(-i * 0.5 * 100),
				translateX(-300),
				translateY(150),
			],
		);

		return cursor;
	});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'transparent',
			}}
		>
			<AbsoluteFill>
				<ColorBars />
			</AbsoluteFill>
			<AbsoluteFill>
				<svg
					viewBox={viewBox.join(' ')}
					style={{
						scale: '2.6',
					}}
				>
					<Faces noSort elements={items} />
				</svg>
			</AbsoluteFill>
			<AbsoluteFill>
				<FrameCounter />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
