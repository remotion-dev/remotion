import {parsePath, PathInternals, reduceInstructions} from '@remotion/paths';
import {makeRect} from '@remotion/shapes';
import {
	extrudeAndTransformElement,
	interpolateMatrix4d,
	makeMatrix3dTransform,
	MatrixTransform4D,
	reduceMatrices,
	rotateX,
	rotateY,
	scaled,
	translateX,
	translateY,
	translateZ,
} from '@remotion/svg-3d-engine';
import {useRef} from 'react';
import {interpolate} from 'remotion';
import {Faces} from './Faces';
import {
	useClickTransforms,
	useHoverTransforms,
	useMousePosition,
} from './hover-transforms';

export const Outer: React.FC<{
	children: React.ReactNode;
	width: number;
	height: number;
}> = ({children, width, height}) => {
	const ref = useRef<HTMLDivElement>(null);

	const hoverTransform = useHoverTransforms(ref);
	const clickTransform = useClickTransforms(ref);
	const angle = useMousePosition(ref);
	// const angle = 0

	const transformationUnhovered: MatrixTransform4D = reduceMatrices([
		rotateX(-Math.PI / 20),
	]);
	const transformationHovered: MatrixTransform4D = reduceMatrices([
		scaled(1.1),
		rotateX(-Math.PI / 16),
		rotateX(Math.sin(angle) / 4),
		// rotateY(-Math.PI / 8),
		rotateY(-Math.cos(angle) / 4),
	]);

	const transformation = interpolateMatrix4d(
		hoverTransform,
		transformationUnhovered,
		transformationHovered,
	);

	const depth =
		interpolate(hoverTransform, [0, 1], [20, 30]) - clickTransform * 20;

	const frontFace = reduceMatrices([translateZ(-depth), transformation]);
	const centerOriented = reduceMatrices([
		translateX(-width / 2),
		translateY(-height / 2),
		transformation,
		translateX(width / 2),
		translateY(height / 2),
	]);

	const cornerRadius = 10;

	const {path, instructions} = makeRect({height, width, cornerRadius});
	const {viewBox} = PathInternals.getBoundingBoxFromInstructions(
		reduceInstructions(instructions),
	);
	const inbetween = extrudeAndTransformElement({
		sideColor: 'black',
		crispEdges: false,
		depth,
		points: parsePath(path),
		description: 'rect',
		transformations: centerOriented,
	});

	return (
		<div ref={ref} className="relative" style={{width, height}}>
			<svg
				viewBox={viewBox}
				style={{
					overflow: 'visible',
					height,
					width,
					position: 'absolute',
					top: 0,
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
