import type {File} from '@babel/types';
import type {ExpressionKind} from 'ast-types/lib/gen/kinds';
import * as recast from 'recast';

export type VisualControlValueFromCode = {
	id: string;
	value: unknown;
	isUndefined: boolean;
};

const getStringValue = (
	node: ExpressionKind | recast.types.namedTypes.SpreadElement,
): string | null => {
	if (node.type === 'StringLiteral') {
		return (node as unknown as {value: string}).value;
	}

	if (node.type === 'TemplateLiteral') {
		const tl = node as unknown as {
			expressions: unknown[];
			quasis: Array<{value: {raw: string}}>;
		};
		if (tl.expressions.length > 0) {
			return null;
		}

		return tl.quasis[0].value.raw;
	}

	return null;
};

const evaluateExpression = (node: ExpressionKind): unknown => {
	switch (node.type) {
		case 'NumericLiteral':
			return (node as unknown as {value: number}).value;
		case 'StringLiteral':
			return (node as unknown as {value: string}).value;
		case 'BooleanLiteral':
			return (node as unknown as {value: boolean}).value;
		case 'NullLiteral':
			return null;
		case 'Identifier': {
			const {name} = node as unknown as {name: string};
			if (name === 'undefined') {
				return undefined;
			}

			throw new Error(`Cannot evaluate identifier: ${name}`);
		}

		case 'UnaryExpression': {
			const unary = node as unknown as {
				operator: string;
				argument: ExpressionKind;
			};
			if (unary.operator === '-') {
				const arg = evaluateExpression(unary.argument);
				if (typeof arg === 'number') {
					return -arg;
				}
			}

			if (unary.operator === '+') {
				const arg = evaluateExpression(unary.argument);
				if (typeof arg === 'number') {
					return arg;
				}
			}

			throw new Error(`Cannot evaluate unary: ${unary.operator}`);
		}

		case 'ObjectExpression': {
			const obj: Record<string, unknown> = {};
			const {properties} = node as unknown as {
				properties: Array<{
					type: string;
					key: {type: string; name?: string; value?: string | number};
					value: ExpressionKind;
				}>;
			};
			for (const prop of properties) {
				if (prop.type !== 'ObjectProperty') {
					continue;
				}

				let key: string | null = null;
				if (prop.key.type === 'Identifier') {
					key = prop.key.name as string;
				} else if (prop.key.type === 'StringLiteral') {
					key = prop.key.value as string;
				} else if (prop.key.type === 'NumericLiteral') {
					key = String(prop.key.value);
				}

				if (key !== null) {
					obj[key] = evaluateExpression(prop.value);
				}
			}

			return obj;
		}

		case 'ArrayExpression': {
			const {elements} = node as unknown as {
				elements: Array<ExpressionKind | null>;
			};
			return elements.map((el) => {
				if (el === null) {
					return null;
				}

				return evaluateExpression(el);
			});
		}

		case 'TemplateLiteral': {
			const tl = node as unknown as {
				expressions: unknown[];
				quasis: Array<{value: {cooked: string}}>;
			};
			if (tl.expressions.length === 0) {
				return tl.quasis[0].value.cooked;
			}

			throw new Error('Cannot evaluate template literal with expressions');
		}

		default:
			throw new Error(`Cannot evaluate AST node: ${node.type}`);
	}
};

export const readVisualControlValues = (
	file: File,
): VisualControlValueFromCode[] => {
	const values: VisualControlValueFromCode[] = [];

	recast.types.visit(file.program, {
		visitCallExpression(path) {
			const {node} = path;

			if (
				node.callee.type !== 'Identifier' ||
				(node.callee as unknown as {name: string}).name !== 'visualControl'
			) {
				return this.traverse(path);
			}

			const firstArg = node.arguments[0];
			const id = getStringValue(
				firstArg as ExpressionKind | recast.types.namedTypes.SpreadElement,
			);
			if (id === null) {
				return this.traverse(path);
			}

			if (node.arguments.length < 2) {
				return this.traverse(path);
			}

			const valueNode = node.arguments[1] as ExpressionKind;

			try {
				if (
					valueNode.type === 'Identifier' &&
					(valueNode as unknown as {name: string}).name === 'undefined'
				) {
					values.push({id, value: null, isUndefined: true});
				} else {
					values.push({
						id,
						value: evaluateExpression(valueNode),
						isUndefined: false,
					});
				}
			} catch {
				// Skip values we can't evaluate statically
			}

			return this.traverse(path);
		},
	});

	return values;
};
