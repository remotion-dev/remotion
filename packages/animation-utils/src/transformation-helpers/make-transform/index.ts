import type {TransformFunctionReturnType} from '../../type';
import {
	matrix,
	matrix3d,
	perspective,
	rotate,
	rotate3d,
	rotateX,
	rotateY,
	rotateZ,
	scale,
	scale3d,
	scaleX,
	scaleY,
	scaleZ,
	skew,
	skewX,
	skewY,
	translate,
	translate3d,
	translateX,
	translateY,
	translateZ,
} from './transform-functions';

export const makeTransform = (
	transforms: TransformFunctionReturnType[],
): string => {
	return transforms.join(' ');
};

export {
	matrix,
	matrix3d,
	perspective,
	rotate,
	rotate3d,
	rotateX,
	rotateY,
	rotateZ,
	scale,
	scale3d,
	scaleX,
	scaleY,
	scaleZ,
	skew,
	skewX,
	skewY,
	translate,
	translate3d,
	translateX,
	translateY,
	translateZ,
};
