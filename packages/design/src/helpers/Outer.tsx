import {parsePath, PathInternals, reduceInstructions} from '@remotion/paths';
import {makeRect} from '@remotion/shapes';
import type {MatrixTransform4D} from '@remotion/svg-3d-engine';
import {
	extrudeAndTransformElement,
	interpolateMatrix4d,
	makeMatrix3dTransform,
	reduceMatrices,
	rotateX,
	rotateY,
	scaled,
	translateX,
	translateY,
	translateZ,
} from '@remotion/svg-3d-engine';
import {interpolate} from 'remotion';
import {Faces} from './Faces';
import {useClickTransforms, useMousePosition} from './hover-transforms';

export const Outer: React.FC<{
	children: React.ReactNode;
	width: number;
	height: number;
	cornerRadius: number;
	hoverTransform: number;
	parentRef: React.RefObject<HTMLDivElement | null>;
}> = ({children, width, height, cornerRadius, hoverTransform, parentRef}) => {
	const clickTransform = useClickTransforms(parentRef);
	const angle = useMousePosition(parentRef);

	const appropriateScale = Math.min(1.1, (20 + width) / width);

	const transformationUnhovered: MatrixTransform4D = reduceMatrices([
		rotateX(-Math.PI / 20),
	]);
	const transformationHovered: MatrixTransform4D = reduceMatrices([
		scaled(appropriateScale),
		rotateX(-Math.PI / 16),
		rotateX(Math.sin(angle) / 4),
		rotateY(-Math.cos(angle) / 4),
	]);

	const transformation = interpolateMatrix4d(
		hoverTransform,
		transformationUnhovered,
		transformationHovered,
	);

	const depthFromClick = clickTransform * 15;
	const depthFromHover = interpolate(hoverTransform, [0, 1], [10, 20]);
	const depth = depthFromHover;

	const frontFace = reduceMatrices([
		translateZ(-depth / 2 + depthFromClick),
		transformation,
	]);
	const centerOriented = reduceMatrices([
		translateX(-width / 2),
		translateY(-height / 2),
		transformation,
		translateX(width / 2),
		translateY(height / 2),
	]);

	const {path, instructions} = makeRect({height, width, cornerRadius});
	const {viewBox} = PathInternals.getBoundingBoxFromInstructions(
		reduceInstructions(instructions),
	);
	const inbetween = extrudeAndTransformElement({
		sideColor: 'black',
		crispEdges: false,
		depth,
		pressInDepth: depthFromClick,
		points: parsePath(path),
		description: 'rect',
		transformations: centerOriented,
	});

	return (
		<div className="relative" style={{width, height}}>
			<svg
				viewBox={viewBox}
				style={{
					overflow: 'visible',
					height,
					width,
					position: 'absolute',
					top: 0,
					left: 0,
				}}
				pointerEvents="none"
			>
				<Faces elements={inbetween} />
			</svg>
			<div
				style={{
					transform: makeMatrix3dTransform(frontFace),
				}}
			>
				{children}
			</div>
		</div>
	);
};
