import {
	aroundCenterPoint,
	makeMatrix3dTransform,
	reduceMatrices,
	rotateX,
	translateY,
	translateZ,
} from '@remotion/svg-3d-engine';
import React from 'react';
import {useTransformations} from './transformation-context';
import {isTopsideVisible} from './viewing-frontside';

export const TopSide: React.FC<{
	readonly children: React.ReactNode;
	readonly width: number;
	readonly height: number;
	readonly depth: number;
}> = ({children, width, height, depth}) => {
	const transforms = useTransformations();
	const topVisible = isTopsideVisible(transforms);

	if (!topVisible) {
		return null;
	}

	const newTransform = reduceMatrices([
		rotateX(-Math.PI / 2),
		translateZ(depth / 2),
		aroundCenterPoint({matrix: transforms, x: width / 2, y: height / 2, z: 0}),
	]);

	return (
		<div
			style={{
				width,
				height: depth,
				position: 'absolute',
				transform: makeMatrix3dTransform(newTransform),
				transformOrigin: '0 0',
			}}
		>
			{children}
		</div>
	);
};

export const BottomSide: React.FC<{
	readonly children: React.ReactNode;
	readonly width: number;
	readonly height: number;
	readonly depth: number;
}> = ({children, width, height, depth}) => {
	const transforms = useTransformations();
	const topSide = isTopsideVisible(transforms);

	if (topSide) {
		return null;
	}

	const newTransform = reduceMatrices([
		rotateX(Math.PI / 2),
		translateZ(-depth / 2),
		translateY(height),
		aroundCenterPoint({matrix: transforms, x: width / 2, y: height / 2, z: 0}),
	]);

	return (
		<div
			style={{
				width,
				height: depth,
				position: 'absolute',
				transform: makeMatrix3dTransform(newTransform),
				transformOrigin: '0 0',
			}}
		>
			{children}
		</div>
	);
};
