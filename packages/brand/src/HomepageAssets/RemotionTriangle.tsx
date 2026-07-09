import {getBoundingBox, parsePath, translatePath} from '@remotion/paths';
import {makeTriangle} from '@remotion/shapes';
import React from 'react';
import {
	AbsoluteFill,
	Composition,
	Interactive,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {BLUE} from './colors';
import {transformAroundItself} from './element';
import {Faces} from './Faces';
import {extrudeElement} from './join-inbetween-tiles';
import {rotateX, scaled} from './matrix';

export const RemotionTriangle: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const progress = spring({
		fps,
		frame,
		config: {
			damping: 18,
			mass: 0.8,
			stiffness: 120,
		},
		durationInFrames: 60,
	});
	const triangle = makeTriangle({
		direction: 'right',
		length: 760,
		edgeRoundness: 0.71,
	});
	const triangleBounds = getBoundingBox(triangle.path);
	const centeredTrianglePath = translatePath(
		triangle.path,
		-(triangleBounds.x1 + triangleBounds.x2) / 2,
		-(triangleBounds.y1 + triangleBounds.y2) / 2,
	);
	const finalTriangleBounds = getBoundingBox(centeredTrianglePath);
	const outlineGap = 24;
	const outlineBounds = {
		x1: finalTriangleBounds.x1 - outlineGap,
		x2: finalTriangleBounds.x2 + outlineGap,
		y1: finalTriangleBounds.y1 - outlineGap,
		y2: finalTriangleBounds.y2 + outlineGap,
	};
	const triangleElement = transformAroundItself(
		extrudeElement({
			backFaceColor: BLUE,
			sideColor: 'black',
			frontFaceColor: BLUE,
			depth: 80,
			points: parsePath(centeredTrianglePath),
			strokeWidth: 12,
			description: 'remotion-triangle',
			strokeColor: 'black',
			crispEdges: true,
		}),
		[
			scaled(interpolate(progress, [0, 1], [0, 1])),
			rotateX(interpolate(progress, [0, 1], [-Math.PI, 0])),
		],
	);

	return (
		<AbsoluteFill>
			<Interactive.Svg
				viewBox="-540 -540 1080 1080"
				style={{
					height: '100%',
					overflow: 'visible',
					width: '100%',
					scale: 0.667,
				}}
			>
				<Faces elements={[triangleElement]} />
				<Interactive.Rect
					fill="none"
					height={outlineBounds.y2 - outlineBounds.y1}
					stroke="#0d99ff"
					strokeWidth={5}
					vectorEffect="non-scaling-stroke"
					width={outlineBounds.x2 - outlineBounds.x1}
					x={outlineBounds.x1}
					y={outlineBounds.y1}
				/>
				<Interactive.Rect
					fill="white"
					height={40}
					stroke="#0d99ff"
					strokeWidth={5}
					vectorEffect="non-scaling-stroke"
					width={40}
					x={outlineBounds.x1 - 20}
					y={outlineBounds.y1 - 20}
				/>
				<Interactive.Rect
					fill="white"
					height={40}
					stroke="#0d99ff"
					strokeWidth={5}
					vectorEffect="non-scaling-stroke"
					width={40}
					x={outlineBounds.x2 - 20}
					y={outlineBounds.y1 - 20}
				/>
				<Interactive.Rect
					fill="white"
					height={40}
					stroke="#0d99ff"
					strokeWidth={5}
					vectorEffect="non-scaling-stroke"
					width={40}
					x={outlineBounds.x1 - 20}
					y={outlineBounds.y2 - 20}
				/>
				<Interactive.Rect
					fill="white"
					height={40}
					stroke="#0d99ff"
					strokeWidth={5}
					vectorEffect="non-scaling-stroke"
					width={40}
					x={outlineBounds.x2 - 20}
					y={outlineBounds.y2 - 20}
				/>
			</Interactive.Svg>
		</AbsoluteFill>
	);
};

export const RemotionTriangleComposition: React.FC = () => {
	return (
		<Composition
			id="RemotionTriangle"
			component={RemotionTriangle}
			durationInFrames={90}
			fps={30}
			width={1080}
			height={1080}
		/>
	);
};
