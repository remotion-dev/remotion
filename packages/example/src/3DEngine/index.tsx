import {makeRect} from '@remotion/shapes';
import {
	makeMatrix3dTransform,
	MatrixTransform4D,
	reduceMatrices,
	rotateX,
	rotateY,
	scaled,
	translateX,
	translateY,
} from '@remotion/svg-3d-engine';
import React, {useRef} from 'react';
import {AbsoluteFill} from 'remotion';
import {Svg} from './Svg';

const measure = (
	ref: React.RefObject<HTMLDivElement | null>,
	scale: number,
) => {
	const reffed = ref.current?.getClientRects();
	if (!reffed?.[0]) {
		throw new Error('No ref');
	}
	return {
		width: reffed[0].width / scale,
		height: reffed[0].height / scale,
	};
};

const transformations: MatrixTransform4D[] = [
	scaled(0.9),
	rotateY(Math.PI / 8),
	rotateX(Math.PI / 8),
];

export const ThreeDEngine = () => {
	const ref = useRef<HTMLDivElement>(null);

	const width = 300;
	const height = 300;

	const reduced = reduceMatrices(transformations);
	const centerOriented = reduceMatrices([
		translateX(-width / 2),
		translateY(-height / 2),
		...transformations,
		translateX(width / 2),
		translateY(height / 2),
	]);

	return (
		<AbsoluteFill className="flex justify-center items-center">
			<div
				ref={ref}
				style={{
					transform: makeMatrix3dTransform(reduced),
				}}
				className="bg-red-700 text-white w-[300px] h-[300px] flex justify-center items-center font-sans text-2xl"
			>
				hi there
			</div>
			<Svg
				transformation={centerOriented}
				svgShape={makeRect({height, width}).path}
			/>
		</AbsoluteFill>
	);
};
