import type {Expression} from '@babel/types';
import type {ExpressionKind} from 'ast-types/lib/gen/kinds';
import * as recast from 'recast';
import type {VideoConfigNumericExpression} from 'remotion';
import type {VideoConfigIdentifierValues} from './video-config-values';

const b = recast.types.builders;

const getNumericLiteral = (node: Expression): number | null => {
	if (node.type === 'NumericLiteral') {
		return Number.isFinite(node.value) ? node.value : null;
	}

	if (
		node.type === 'UnaryExpression' &&
		(node.operator === '-' || node.operator === '+') &&
		node.argument.type === 'NumericLiteral'
	) {
		const value =
			node.operator === '-' ? -node.argument.value : node.argument.value;
		return Number.isFinite(value) ? value : null;
	}

	if (node.type === 'TSAsExpression') {
		return getNumericLiteral(node.expression as Expression);
	}

	return null;
};

const getVideoConfigValue = ({
	node,
	videoConfigValues,
}: {
	node: Expression;
	videoConfigValues: VideoConfigIdentifierValues;
}): {identifier: string; value: number} | null => {
	if (node.type === 'TSAsExpression') {
		return getVideoConfigValue({
			node: node.expression as Expression,
			videoConfigValues,
		});
	}

	if (node.type !== 'Identifier') {
		return null;
	}

	const value = videoConfigValues[node.name];
	if (value === undefined || !Number.isFinite(value)) {
		return null;
	}

	return {identifier: node.name, value};
};

const parseMultiplication = ({
	left,
	right,
	videoConfigValues,
}: {
	left: Expression;
	right: Expression;
	videoConfigValues: VideoConfigIdentifierValues;
}): VideoConfigNumericExpression | null => {
	const leftNumber = getNumericLiteral(left);
	const rightNumber = getNumericLiteral(right);
	const leftVideoConfig = getVideoConfigValue({
		node: left,
		videoConfigValues,
	});
	const rightVideoConfig = getVideoConfigValue({
		node: right,
		videoConfigValues,
	});

	const factorPosition =
		leftNumber !== null && rightVideoConfig !== null
			? 'left'
			: rightNumber !== null && leftVideoConfig !== null
				? 'right'
				: null;
	if (factorPosition === null) {
		return null;
	}

	const multiplier = factorPosition === 'left' ? leftNumber! : rightNumber!;
	const configValue =
		factorPosition === 'left' ? rightVideoConfig! : leftVideoConfig!;
	const value = multiplier * configValue.value;
	if (!Number.isFinite(value)) {
		return null;
	}

	return {
		type: 'video-config-multiplication',
		identifier: configValue.identifier,
		multiplier,
		multiplicand: configValue.value,
		factorPosition,
		value,
	};
};

const parseSubtraction = ({
	left,
	right,
	videoConfigValues,
}: {
	left: Expression;
	right: Expression;
	videoConfigValues: VideoConfigIdentifierValues;
}): VideoConfigNumericExpression | null => {
	const leftNumber = getNumericLiteral(left);
	const rightNumber = getNumericLiteral(right);
	const leftVideoConfig = getVideoConfigValue({
		node: left,
		videoConfigValues,
	});
	const rightVideoConfig = getVideoConfigValue({
		node: right,
		videoConfigValues,
	});

	const amountPosition =
		leftNumber !== null && rightVideoConfig !== null
			? 'left'
			: rightNumber !== null && leftVideoConfig !== null
				? 'right'
				: null;
	if (amountPosition === null) {
		return null;
	}

	const amount = amountPosition === 'left' ? leftNumber! : rightNumber!;
	const configValue =
		amountPosition === 'left' ? rightVideoConfig! : leftVideoConfig!;
	const value =
		amountPosition === 'left'
			? amount - configValue.value
			: configValue.value - amount;
	if (!Number.isFinite(value)) {
		return null;
	}

	return {
		type: 'video-config-subtraction',
		identifier: configValue.identifier,
		amount,
		configValue: configValue.value,
		amountPosition,
		value,
	};
};

export const parseVideoConfigNumericExpression = ({
	node,
	videoConfigValues,
}: {
	node: Expression;
	videoConfigValues: VideoConfigIdentifierValues;
}): VideoConfigNumericExpression | null => {
	if (node.type === 'TSAsExpression') {
		return parseVideoConfigNumericExpression({
			node: node.expression as Expression,
			videoConfigValues,
		});
	}

	const literal = getNumericLiteral(node);
	if (literal !== null) {
		return {type: 'literal', value: literal};
	}

	const videoConfigValue = getVideoConfigValue({node, videoConfigValues});
	if (videoConfigValue !== null) {
		return {type: 'video-config-value', ...videoConfigValue};
	}

	if (node.type !== 'BinaryExpression') {
		return null;
	}

	const left = node.left as Expression;
	const right = node.right as Expression;

	if (node.operator === '*') {
		return parseMultiplication({left, right, videoConfigValues});
	}

	if (node.operator === '-') {
		return parseSubtraction({left, right, videoConfigValues});
	}

	return null;
};

const numericExpression = (value: number): ExpressionKind => {
	if (value < 0) {
		return b.unaryExpression('-', b.numericLiteral(-value), true);
	}

	return b.numericLiteral(value);
};

export const updateVideoConfigNumericExpression = ({
	expression,
	value,
}: {
	expression: VideoConfigNumericExpression;
	value: number;
}): ExpressionKind => {
	if (!Number.isFinite(value)) {
		return numericExpression(value);
	}

	if (expression.type === 'video-config-value') {
		return value === expression.value
			? b.identifier(expression.identifier)
			: numericExpression(value);
	}

	if (expression.type === 'video-config-multiplication') {
		if (value === 0) {
			return numericExpression(value);
		}

		const multiplier = value / expression.multiplicand;
		if (!Number.isFinite(multiplier) || multiplier === 0) {
			return numericExpression(value);
		}

		const factor = numericExpression(multiplier);
		const identifier = b.identifier(expression.identifier);
		return expression.factorPosition === 'left'
			? b.binaryExpression('*', factor, identifier)
			: b.binaryExpression('*', identifier, factor);
	}

	if (expression.type === 'video-config-subtraction') {
		const amount =
			expression.amountPosition === 'left'
				? value + expression.configValue
				: expression.configValue - value;
		if (!Number.isFinite(amount)) {
			return numericExpression(value);
		}

		if (amount === 0 && expression.amountPosition === 'right') {
			return b.identifier(expression.identifier);
		}

		const amountNode = numericExpression(amount);
		const identifier = b.identifier(expression.identifier);
		return expression.amountPosition === 'left'
			? b.binaryExpression('-', amountNode, identifier)
			: b.binaryExpression('-', identifier, amountNode);
	}

	return numericExpression(value);
};
