import {readFileSync} from 'node:fs';
import path from 'node:path';
import type {
	Expression,
	File,
	JSXAttribute,
	JSXOpeningElement,
	ObjectExpression,
	ObjectProperty,
	UnaryExpression,
} from '@babel/types';
import type {CanUpdateSequencePropsResponse} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {CanUpdateSequencePropStatus} from 'remotion';
import {parseAst} from '../../codemods/parse-ast';

type CanUpdatePropStatus = CanUpdateSequencePropStatus;

export const isStaticValue = (node: Expression): boolean => {
	switch (node.type) {
		case 'NumericLiteral':
		case 'StringLiteral':
		case 'BooleanLiteral':
		case 'NullLiteral':
			return true;
		case 'UnaryExpression':
			return (
				((node as UnaryExpression).operator === '-' ||
					(node as UnaryExpression).operator === '+') &&
				(node as UnaryExpression).argument.type === 'NumericLiteral'
			);
		case 'ArrayExpression':
			return (
				node as Extract<Expression, {type: 'ArrayExpression'}>
			).elements.every(
				(el) => el !== null && el.type !== 'SpreadElement' && isStaticValue(el),
			);
		case 'ObjectExpression':
			return (node as ObjectExpression).properties.every(
				(prop) =>
					prop.type === 'ObjectProperty' &&
					isStaticValue((prop as ObjectProperty).value as Expression),
			);
		default:
			return false;
	}
};

export const extractStaticValue = (node: Expression): unknown => {
	switch (node.type) {
		case 'NumericLiteral':
		case 'StringLiteral':
		case 'BooleanLiteral':
			return (node as {value: unknown}).value;
		case 'NullLiteral':
			return null;
		case 'UnaryExpression': {
			const un = node as UnaryExpression;
			if (un.argument.type === 'NumericLiteral') {
				const val = (un.argument as {value: number}).value;
				return un.operator === '-' ? -val : val;
			}

			return undefined;
		}

		case 'ArrayExpression':
			return (
				node as Extract<Expression, {type: 'ArrayExpression'}>
			).elements.map((el) => {
				if (el === null || el.type === 'SpreadElement') {
					return undefined;
				}

				return extractStaticValue(el);
			});
		case 'ObjectExpression': {
			const obj = node as ObjectExpression;
			const result: Record<string, unknown> = {};
			for (const prop of obj.properties) {
				if (prop.type === 'ObjectProperty') {
					const p = prop as ObjectProperty;
					const key =
						p.key.type === 'Identifier'
							? (p.key as {name: string}).name
							: p.key.type === 'StringLiteral' ||
								  p.key.type === 'NumericLiteral'
								? String((p.key as {value: unknown}).value)
								: undefined;
					if (key !== undefined) {
						result[key] = extractStaticValue(p.value as Expression);
					}
				}
			}

			return result;
		}

		default:
			return undefined;
	}
};

const getPropsStatus = (
	jsxElement: JSXOpeningElement,
): Record<string, CanUpdatePropStatus> => {
	const props: Record<string, CanUpdatePropStatus> = {};

	for (const attr of jsxElement.attributes) {
		if (attr.type === 'JSXSpreadAttribute') {
			continue;
		}

		if (attr.name.type === 'JSXNamespacedName') {
			continue;
		}

		const {name} = attr.name;
		if (typeof name !== 'string') {
			continue;
		}

		const {value} = attr as JSXAttribute;

		if (!value) {
			props[name] = {canUpdate: true, codeValue: true};
			continue;
		}

		if (value.type === 'StringLiteral') {
			props[name] = {
				canUpdate: true,
				codeValue: (value as {value: string}).value,
			};
			continue;
		}

		if (value.type === 'JSXExpressionContainer') {
			const {expression} = value;
			if (
				expression.type === 'JSXEmptyExpression' ||
				!isStaticValue(expression)
			) {
				props[name] = {canUpdate: false, reason: 'computed'};
				continue;
			}

			props[name] = {
				canUpdate: true,
				codeValue: extractStaticValue(expression),
			};
			continue;
		}

		props[name] = {canUpdate: false, reason: 'computed'};
	}

	return props;
};

const findJsxElementAtLine = (
	ast: File,
	targetLine: number,
): JSXOpeningElement | null => {
	let found: JSXOpeningElement | null = null;

	recast.types.visit(ast, {
		visitJSXOpeningElement(nodePath) {
			const {node} = nodePath;
			if (node.loc && node.loc.start.line === targetLine) {
				found = node as unknown as JSXOpeningElement;
				return false;
			}

			return this.traverse(nodePath);
		},
	});

	return found;
};

const getNestedPropStatus = (
	jsxElement: JSXOpeningElement,
	parentKey: string,
	childKey: string,
): CanUpdatePropStatus => {
	const attr = jsxElement.attributes.find(
		(a) =>
			a.type !== 'JSXSpreadAttribute' &&
			a.name.type !== 'JSXNamespacedName' &&
			a.name.name === parentKey,
	) as JSXAttribute | undefined;

	if (!attr || !attr.value) {
		// Parent attribute doesn't exist, nested prop can be added
		return {canUpdate: true, codeValue: undefined};
	}

	if (attr.value.type !== 'JSXExpressionContainer') {
		return {canUpdate: false, reason: 'computed'};
	}

	const {expression} = attr.value;
	if (
		expression.type === 'JSXEmptyExpression' ||
		expression.type !== 'ObjectExpression'
	) {
		// Parent is not an object literal (e.g. style={myStyles})
		return {canUpdate: false, reason: 'computed'};
	}

	const objExpr = expression as ObjectExpression;
	const prop = objExpr.properties.find(
		(p) =>
			p.type === 'ObjectProperty' &&
			((p.key.type === 'Identifier' && p.key.name === childKey) ||
				(p.key.type === 'StringLiteral' && p.key.value === childKey)),
	) as ObjectProperty | undefined;

	if (!prop) {
		// Property not set in the object, can be added
		return {canUpdate: true, codeValue: undefined};
	}

	const propValue = prop.value as Expression;
	if (!isStaticValue(propValue)) {
		return {canUpdate: false, reason: 'computed'};
	}

	return {canUpdate: true, codeValue: extractStaticValue(propValue)};
};

export const computeSequencePropsStatus = ({
	fileName,
	line,
	keys,
	remotionRoot,
}: {
	fileName: string;
	line: number;
	keys: string[];
	remotionRoot: string;
}): CanUpdateSequencePropsResponse => {
	try {
		const absolutePath = path.resolve(remotionRoot, fileName);
		const fileRelativeToRoot = path.relative(remotionRoot, absolutePath);
		if (fileRelativeToRoot.startsWith('..')) {
			throw new Error('Cannot read a file outside the project');
		}

		const fileContents = readFileSync(absolutePath, 'utf-8');
		const ast = parseAst(fileContents);

		const jsxElement = findJsxElementAtLine(ast, line);

		if (!jsxElement) {
			throw new Error('Could not find a JSX element at the specified location');
		}

		const allProps = getPropsStatus(jsxElement);
		const filteredProps: Record<string, CanUpdatePropStatus> = {};
		for (const key of keys) {
			const dotIndex = key.indexOf('.');
			if (dotIndex !== -1) {
				filteredProps[key] = getNestedPropStatus(
					jsxElement,
					key.slice(0, dotIndex),
					key.slice(dotIndex + 1),
				);
			} else if (key in allProps) {
				filteredProps[key] = allProps[key];
			} else {
				filteredProps[key] = {canUpdate: true, codeValue: undefined};
			}
		}

		return {
			canUpdate: true as const,
			props: filteredProps,
		};
	} catch (err) {
		return {
			canUpdate: false as const,
			reason: (err as Error).message,
		};
	}
};
