import type {Expression} from '@babel/types';

export const getStaticNumericValue = (node: Expression): number | null => {
	if (node.type === 'NumericLiteral') {
		return Number.isFinite(node.value) ? node.value : null;
	}

	if (
		node.type === 'UnaryExpression' &&
		(node.operator === '-' || node.operator === '+')
	) {
		const value = getStaticNumericValue(node.argument);
		return value === null ? null : node.operator === '-' ? -value : value;
	}

	if (node.type === 'TSAsExpression') {
		return getStaticNumericValue(node.expression);
	}

	if (node.type === 'BinaryExpression' && node.operator === '/') {
		const left = getStaticNumericValue(node.left as Expression);
		const right = getStaticNumericValue(node.right);
		if (left === null || right === null) {
			return null;
		}

		const value = left / right;
		return Number.isFinite(value) ? value : null;
	}

	return null;
};
