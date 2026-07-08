import type {CallExpression, Expression} from '@babel/types';
import {
	CUBIC_KEYFRAME_EASING,
	EASE_KEYFRAME_EASING,
	getBackKeyframeEasing,
	getOutKeyframeEasing,
	getPolyKeyframeEasing,
	LINEAR_KEYFRAME_EASING,
	parseSpringEasingConfig,
	QUAD_KEYFRAME_EASING,
} from '@remotion/studio-shared';
import type {CanUpdateSequencePropStatusEasing} from 'remotion';

const getNumericValue = (node: Expression): number | null => {
	if (node.type === 'NumericLiteral') {
		return node.value;
	}

	if (
		node.type === 'UnaryExpression' &&
		(node.operator === '-' || node.operator === '+') &&
		node.argument.type === 'NumericLiteral'
	) {
		return node.operator === '-' ? -node.argument.value : node.argument.value;
	}

	if (node.type === 'TSAsExpression') {
		return getNumericValue(node.expression as Expression);
	}

	return null;
};

const getExpressionArgument = (
	arg: CallExpression['arguments'][number] | undefined,
): Expression | null => {
	if (
		arg === undefined ||
		arg.type === 'ArgumentPlaceholder' ||
		arg.type === 'JSXNamespacedName' ||
		arg.type === 'SpreadElement'
	) {
		return null;
	}

	return arg as Expression;
};

const getMemberExpressionKeyframeEasing = (
	name: string,
): CanUpdateSequencePropStatusEasing | null => {
	if (name === 'linear') {
		return LINEAR_KEYFRAME_EASING;
	}

	if (name === 'ease') {
		return EASE_KEYFRAME_EASING;
	}

	if (name === 'quad') {
		return QUAD_KEYFRAME_EASING;
	}

	if (name === 'cubic') {
		return CUBIC_KEYFRAME_EASING;
	}

	return null;
};

export const parseKeyframeEasingExpression = (
	node: Expression,
): CanUpdateSequencePropStatusEasing | null => {
	if (node.type === 'TSAsExpression') {
		return parseKeyframeEasingExpression(node.expression as Expression);
	}

	if (
		node.type === 'MemberExpression' &&
		node.object.type === 'Identifier' &&
		node.object.name === 'Easing' &&
		node.property.type === 'Identifier' &&
		node.computed === false
	) {
		return getMemberExpressionKeyframeEasing(node.property.name);
	}

	if (
		node.type !== 'CallExpression' ||
		node.callee.type !== 'MemberExpression' ||
		node.callee.object.type !== 'Identifier' ||
		node.callee.object.name !== 'Easing' ||
		node.callee.property.type !== 'Identifier' ||
		node.callee.computed
	) {
		return null;
	}

	const propertyName = node.callee.property.name;

	if (propertyName === 'spring') {
		if (node.arguments.length > 1) {
			return null;
		}

		if (node.arguments.length === 0) {
			return parseSpringEasingConfig(undefined);
		}

		const springConfig = getExpressionArgument(node.arguments[0]);
		return springConfig ? parseSpringEasingConfig(springConfig) : null;
	}

	if (propertyName === 'bezier') {
		if (node.arguments.length !== 4) {
			return null;
		}

		const values = node.arguments.map((arg) => {
			const expression = getExpressionArgument(arg);
			return expression ? getNumericValue(expression) : null;
		});

		if (values.some((value) => value === null)) {
			return null;
		}

		const [x1, y1, x2, y2] = values as [number, number, number, number];
		return {type: 'bezier', x1, y1, x2, y2};
	}

	if (propertyName === 'back') {
		if (node.arguments.length > 1) {
			return null;
		}

		if (node.arguments.length === 0) {
			return getBackKeyframeEasing();
		}

		const expression = getExpressionArgument(node.arguments[0]);
		if (!expression) {
			return null;
		}

		const s = getNumericValue(expression);
		if (s === null) {
			return null;
		}

		return getBackKeyframeEasing(s);
	}

	if (propertyName === 'poly') {
		if (node.arguments.length !== 1) {
			return null;
		}

		const expression = getExpressionArgument(node.arguments[0]);
		const n = expression ? getNumericValue(expression) : null;
		return n === null ? null : getPolyKeyframeEasing(n);
	}

	if (propertyName === 'in') {
		if (node.arguments.length !== 1) {
			return null;
		}

		const expression = getExpressionArgument(node.arguments[0]);
		return expression ? parseKeyframeEasingExpression(expression) : null;
	}

	if (propertyName === 'out') {
		if (node.arguments.length !== 1) {
			return null;
		}

		const expression = getExpressionArgument(node.arguments[0]);
		const easing = expression
			? parseKeyframeEasingExpression(expression)
			: null;
		return easing ? getOutKeyframeEasing(easing) : null;
	}

	if (propertyName === 'inOut') {
		if (node.arguments.length !== 1) {
			return null;
		}

		const expression = getExpressionArgument(node.arguments[0]);
		const easing = expression
			? parseKeyframeEasingExpression(expression)
			: null;
		return easing?.type === 'linear' ? easing : null;
	}

	return null;
};
