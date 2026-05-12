import type {
	CallExpression,
	Expression,
	File,
	Node,
	OptionalCallExpression,
	ParenthesizedExpression,
	TSAsExpression,
} from '@babel/types';
import type {types as RecastTypes} from 'recast';
import type {SequenceNodePath} from 'remotion';
import {findJsxElementPathForDeletion} from './delete-jsx-node';

const unwrapExpression = (expr: Expression): Expression => {
	if (expr.type === 'TSAsExpression') {
		return unwrapExpression((expr as TSAsExpression).expression as Expression);
	}

	if (expr.type === 'ParenthesizedExpression') {
		return unwrapExpression(
			(expr as ParenthesizedExpression).expression as Expression,
		);
	}

	return expr;
};

/**
 * Whether the callee is a `.map(...)` member call (including optional `?.map`).
 */
export const isMapCallee = (callee: Expression): boolean => {
	const c = unwrapExpression(callee);
	if (c.type === 'MemberExpression') {
		if (c.computed) {
			return c.property.type === 'StringLiteral' && c.property.value === 'map';
		}

		return c.property.type === 'Identifier' && c.property.name === 'map';
	}

	if (c.type === 'OptionalMemberExpression') {
		if (c.computed) {
			return c.property.type === 'StringLiteral' && c.property.value === 'map';
		}

		return c.property.type === 'Identifier' && c.property.name === 'map';
	}

	return false;
};

/**
 * True when the JSX element at `nodePath` is defined inside a `.map()` callback
 * (array iteration). Used to flag duplicate / edit behavior for list-driven JSX.
 */
export const isJsxUnderMapCallback = (
	ast: File,
	nodePath: SequenceNodePath,
): boolean => {
	const jsxPath = findJsxElementPathForDeletion(ast, nodePath);
	if (!jsxPath) {
		return false;
	}

	let path: RecastTypes.NodePath | null = jsxPath.parentPath;
	while (path) {
		const n = path.node as Node;
		if (
			n.type === 'ArrowFunctionExpression' ||
			n.type === 'FunctionExpression'
		) {
			const outer = path.parentPath;
			if (outer?.node.type === 'CallExpression') {
				const call = outer.node;
				if (
					isMapCallee(call.callee as Expression) &&
					call.arguments.some(
						(arg: CallExpression['arguments'][number]) => arg === n,
					)
				) {
					return true;
				}
			}

			if (outer?.node.type === 'OptionalCallExpression') {
				const call = outer.node as OptionalCallExpression;
				if (
					isMapCallee(call.callee as Expression) &&
					call.arguments.some(
						(arg: CallExpression['arguments'][number]) => arg === n,
					)
				) {
					return true;
				}
			}
		}

		path = path.parentPath;
	}

	return false;
};
