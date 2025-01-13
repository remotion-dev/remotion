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
import {AbsoluteFill, interpolate} from 'remotion';
import {Faces} from './Faces';
import {
	useClickTransforms,
	useHoverTransforms,
	useMousePosition,
} from './hover-transforms';

export const ThreeDEngine = () => {
	const ref = useRef<HTMLDivElement>(null);

	const width = 200;
	const height = 70;

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
	const extruded = extrudeAndTransformElement({
		backFaceColor: 'black',
		sideColor: 'black',
		crispEdges: false,
		depth,
		points: parsePath(path),
		description: 'rect',
		frontFaceColor: 'white',
		strokeColor: 'black',
		strokeWidth: 3,
		transformations: centerOriented,
	});

	return (
		<AbsoluteFill className="flex justify-center items-center bg-[#F8FAFC]">
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
					<Faces elements={[extruded]} />
				</svg>
				<div
					style={{
						transform: makeMatrix3dTransform(frontFace),
						borderRadius: cornerRadius,
						width,
						height,
						fontFamily: 'GT Planar',
						backgroundColor: 'white',
						border: '2px solid black',
					}}
					className="text-black flex justify-center items-center font-sans text-2xl border-solid border-black font-bold cursor-pointer"
				>
					Get started
				</div>
			</div>
		</AbsoluteFill>
	);
};
