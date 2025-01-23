import {
	MatrixTransform4D,
	reduceMatrices,
	rotateX,
	rotateY,
	scaled,
} from '@remotion/svg-3d-engine';
import React, {useContext, useMemo} from 'react';

type Context = MatrixTransform4D;

export const TransformContext = React.createContext<Context>(scaled(1));

export const NewTransform: React.FC<{
	readonly children: React.ReactNode;
	readonly transform: MatrixTransform4D;
}> = ({children, transform}) => {
	const oldValue = React.useContext(TransformContext);

	const newValue = React.useMemo(() => {
		return reduceMatrices([oldValue, transform]);
	}, [oldValue, transform]);

	return (
		<TransformContext.Provider value={newValue}>
			{children}
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
