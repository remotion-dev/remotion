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
import {SelectionOutline} from './SelectionOutline';

export const RemotionTriangle: React.FC<{
	readonly frame?: number;
	readonly scale: number | null;
	readonly outlineStrokeWidth: number | null;
	readonly outlineHandleSize: number | null;
}> = ({frame: frameOverride, scale, outlineStrokeWidth, outlineHandleSize}) => {
	const currentFrame = useCurrentFrame();
	const frame = frameOverride ?? currentFrame;
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

	const selectionScale = (scale ?? 1) * 0.667;

	return (
		<AbsoluteFill>
			<Interactive.Svg
				viewBox="-540 -540 1080 1080"
				style={{
					height: '100%',
					overflow: 'visible',
					width: '100%',
				}}
			>
				<g
					transform={`scale(${selectionScale})`}
					visibility={scale === 0 ? 'hidden' : 'visible'}
				>
					<Faces elements={[triangleElement]} />
				</g>
			</Interactive.Svg>
			<SelectionOutline
				canvasSize={{width: 1080, height: 1080}}
				bounds={{
					left: 540 + outlineBounds.x1 * selectionScale,
					top: 540 + outlineBounds.y1 * selectionScale,
					width: (outlineBounds.x2 - outlineBounds.x1) * selectionScale,
					height: (outlineBounds.y2 - outlineBounds.y1) * selectionScale,
				}}
				handleSize={outlineHandleSize ?? 40 * selectionScale}
				strokeWidth={outlineStrokeWidth ?? 6 * 0.667}
			/>
		</AbsoluteFill>
	);
};

export const RemotionTriangleComposition: React.FC = () => {
	return (
		<Composition
			id="RemotionTriangle"
			component={RemotionTriangle}
			defaultProps={{
				scale: null,
				outlineStrokeWidth: null,
				outlineHandleSize: null,
			}}
			durationInFrames={90}
			fps={30}
			width={1080}
			height={1080}
		/>
	);
};
