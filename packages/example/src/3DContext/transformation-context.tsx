import {
	type MatrixTransform4D,
	reduceMatrices,
	rotateX,
	rotateY,
	rotateZ,
	scaled,
	translateX,
	translateY,
	translateZ,
} from '@remotion/svg-3d-engine';
import React, {useMemo} from 'react';
import {
	CenterPointContext,
	TransformContext,
} from './transformation-context-context';
import {transformPoint} from './transformation-context-utils';

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
