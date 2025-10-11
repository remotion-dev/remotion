import {
	MatrixTransform4D,
	reduceMatrices,
	rotateX,
	rotateY,
	rotateZ,
	scaled,
	translateX,
	translateY,
	translateZ,
	Vector4D,
} from '@remotion/svg-3d-engine';
import React, {useContext, useMemo} from 'react';

type Context = MatrixTransform4D;

export const TransformContext = React.createContext<Context>(scaled(1));
export const CenterPointContext = React.createContext<
	[number, number, number, number]
>([0, 0, 0, 1]);

export function transformPoint({
	matrix,
	point,
}: {
	matrix: MatrixTransform4D;
	point: Vector4D;
}): Vector4D {
	const [x, y, z, w] = point;
	const result: number[] = [];

	for (let i = 0; i < 4; i++) {
		// For row i, the elements are at indices 4*i, 4*i+1, 4*i+2, and 4*i+3
		result[i] =
			matrix[4 * i + 0] * x +
			matrix[4 * i + 1] * y +
			matrix[4 * i + 2] * z +
			matrix[4 * i + 3] * w;
	}
	return [result[0], result[1], result[2], result[3]];
}

export const isTranslateXYTransform = (
	transform: MatrixTransform4D,
): boolean => {
	return (
		transform[0] === 1 &&
		transform[1] === 0 &&
		transform[2] === 0 &&
		// 3 omitted
		transform[4] === 0 &&
		transform[5] === 1 &&
		transform[6] === 0 &&
		// 7 omitted
		transform[8] === 0 &&
		transform[9] === 0 &&
		transform[10] === 1 &&
		transform[11] === 0 &&
		transform[12] === 0 &&
		transform[13] === 0 &&
		transform[14] === 0 &&
		transform[15] === 1
	);
};

export const NewTransform: React.FC<{
	readonly children: React.ReactNode;
	readonly transform: MatrixTransform4D;
}> = ({children, transform}) => {
	const oldValue = React.useContext(TransformContext);
	const point = React.useContext(CenterPointContext);

	const newValue = React.useMemo(() => {
		return reduceMatrices([oldValue, transform]);
	}, [oldValue, transform]);

	const newCenterPoint = React.useMemo(() => {
		return transformPoint({matrix: transform, point});
	}, [point, transform]);

	return (
		<TransformContext.Provider value={newValue}>
			<CenterPointContext.Provider value={newCenterPoint}>
				{children}
			</CenterPointContext.Provider>
		</TransformContext.Provider>
	);
};

export const RotateX: React.FC<{
	readonly children: React.ReactNode;
	readonly radians: number;
}> = ({children, radians}) => {
	return (
		<NewTransform transform={useMemo(() => rotateX(radians), [radians])}>
			{children}
		</NewTransform>
	);
};
export const RotateZ: React.FC<{
	readonly children: React.ReactNode;
	readonly radians: number;
}> = ({children, radians}) => {
	return (
		<NewTransform transform={useMemo(() => rotateZ(radians), [radians])}>
			{children}
		</NewTransform>
	);
};

export const TranslateY: React.FC<{
	readonly children: React.ReactNode;
	readonly px: number;
}> = ({children, px}) => {
	return (
		<NewTransform transform={useMemo(() => translateY(px), [px])}>
			{children}
		</NewTransform>
	);
};

export const TranslateX: React.FC<{
	readonly children: React.ReactNode;
	readonly px: number;
}> = ({children, px}) => {
	return (
		<NewTransform transform={useMemo(() => translateX(px), [px])}>
			{children}
		</NewTransform>
	);
};

export const TranslateZ: React.FC<{
	readonly children: React.ReactNode;
	readonly px: number;
}> = ({children, px}) => {
	return (
		<NewTransform transform={useMemo(() => translateZ(px), [px])}>
			{children}
		</NewTransform>
	);
};

export const RotateY: React.FC<{
	readonly children: React.ReactNode;
	readonly radians: number;
}> = ({children, radians}) => {
	return (
		<NewTransform transform={useMemo(() => rotateY(radians), [radians])}>
			{children}
		</NewTransform>
	);
};

export const Scale: React.FC<{
	readonly children: React.ReactNode;
	readonly factor: number;
}> = ({children, factor}) => {
	return (
		<NewTransform transform={useMemo(() => scaled(factor), [factor])}>
			{children}
		</NewTransform>
	);
};

export const useTransformations = () => {
	return useContext(TransformContext);
};

export const useCenterPoint = () => {
	return useContext(CenterPointContext);
};
