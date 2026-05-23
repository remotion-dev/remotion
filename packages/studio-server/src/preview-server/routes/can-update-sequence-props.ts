import {readFileSync} from 'node:fs';
import path from 'node:path';
import type {
	CallExpression,
	Expression,
	File,
	JSXAttribute,
	JSXOpeningElement,
	ObjectExpression,
	ObjectProperty,
	TSAsExpression,
	UnaryExpression,
} from '@babel/types';
import {RenderInternals} from '@remotion/renderer';
import type {SubscribeToSequencePropsResponse} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {
	CanUpdateSequencePropsResponseTrue,
	CanUpdateSequencePropStatus,
	LogLevel,
	SequenceNodePath,
} from 'remotion';
import {parseAst} from '../../codemods/parse-ast';
import {getAstNodePath} from '../../helpers/get-ast-node-path';
import {JsxElementNotFoundAtLocationError} from '../jsx-element-not-found-at-location-error';
import {computeEffectPropStatus} from './can-update-effect-props';

type CanUpdatePropStatus = CanUpdateSequencePropStatus;
type ComputedPropStatus = Extract<CanUpdatePropStatus, {canUpdate: false}>;
type PropKeyframes = NonNullable<ComputedPropStatus['keyframes']>;

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
		case 'TSAsExpression':
			return isStaticValue((node as TSAsExpression).expression as Expression);
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

		case 'TSAsExpression':
			return extractStaticValue(
				(node as TSAsExpression).expression as Expression,
			);
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

const getInterpolateKeyframes = (
	node: Expression,
): PropKeyframes | undefined => {
	if (node.type === 'TSAsExpression') {
		return getInterpolateKeyframes(node.expression as Expression);
	}

	if (node.type !== 'CallExpression') {
		return undefined;
	}

	const callExpression = node as CallExpression;
	if (
		callExpression.callee.type !== 'Identifier' ||
		callExpression.callee.name !== 'interpolate'
	) {
		return undefined;
	}

	const inputArg = callExpression.arguments[1];
	const outputArg = callExpression.arguments[2];
	if (
		!inputArg ||
		!outputArg ||
		inputArg.type !== 'ArrayExpression' ||
		outputArg.type !== 'ArrayExpression'
	) {
		return undefined;
	}

	if (inputArg.elements.length !== outputArg.elements.length) {
		return undefined;
	}

	const keyframes: PropKeyframes = [];
	for (let i = 0; i < inputArg.elements.length; i++) {
		const inputElement = inputArg.elements[i];
		const outputElement = outputArg.elements[i];
		if (
			!inputElement ||
			!outputElement ||
			inputElement.type === 'SpreadElement' ||
			outputElement.type === 'SpreadElement'
		) {
			return undefined;
		}

		const frame = getNumericValue(inputElement);
		if (frame === null || !isStaticValue(outputElement)) {
			return undefined;
		}

		keyframes.push({
			frame,
			value: extractStaticValue(outputElement),
		});
	}

	return keyframes.length > 0 ? keyframes : undefined;
};

export const getComputedStatus = (node: Expression): CanUpdatePropStatus => {
	const keyframes = getInterpolateKeyframes(node);
	if (!keyframes) {
		return {canUpdate: false, reason: 'computed'};
	}

	return {
		canUpdate: false,
		reason: 'computed',
		keyframes,
	};
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
			if (expression.type === 'JSXEmptyExpression') {
				props[name] = {canUpdate: false, reason: 'computed'};
				continue;
			}

			if (!isStaticValue(expression)) {
				props[name] = getComputedStatus(expression);
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

const getNodePathForRecastPath = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	recastPath: any,
): SequenceNodePath => {
	const segments: Array<string | number> = [];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let current: any = recastPath;
	while (current && current.parentPath) {
		segments.unshift(current.name);
		current = current.parentPath;
	}

	// Recast paths start with "root" which doesn't correspond to a real AST property
	if (segments.length > 0 && segments[0] === 'root') {
		return segments.slice(1);
	}

	return segments;
};

export const findJsxElementAtNodePath = (
	ast: File,
	nodePath: SequenceNodePath,
): JSXOpeningElement | null => {
	const current = getAstNodePath(ast, nodePath);
	if (!current) {
		return null;
	}

	if (recast.types.namedTypes.JSXOpeningElement.check(current.value)) {
		return current.value as unknown as JSXOpeningElement;
	}

	return null;
};

export const lineColumnToNodePath = (
	ast: File,
	targetLine: number,
): SequenceNodePath | null => {
	let foundPath: SequenceNodePath | null = null;

	recast.types.visit(ast, {
		visitJSXOpeningElement(p) {
			const {node} = p;
			if (node.loc && node.loc.start.line === targetLine) {
				foundPath = getNodePathForRecastPath(p);
				return false;
			}

			return this.traverse(p);
		},
	});

	return foundPath;
};

const PIXEL_VALUE_REGEX = /^-?\d+(\.\d+)?px$/;

const isSupportedTranslateValue = (value: string): boolean => {
	const parts = value.split(/\s+/);
	if (parts.length === 1 || parts.length === 2) {
		return parts.every((part) => PIXEL_VALUE_REGEX.test(part));
	}

	return false;
};

const validateStyleValue = (childKey: string, value: unknown): boolean => {
	if (childKey === 'translate' && typeof value === 'string') {
		return isSupportedTranslateValue(value);
	}

	return true;
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
		return getComputedStatus(propValue);
	}

	const codeValue = extractStaticValue(propValue);
	if (!validateStyleValue(childKey, codeValue)) {
		return {canUpdate: false, reason: 'computed'};
	}

	return {canUpdate: true, codeValue};
};

const computeEffectsForJsx = ({
	jsxElement,
	effects,
}: {
	jsxElement: JSXOpeningElement;
	effects: string[][];
}) => {
	return effects.map((effect, effectIndex) =>
		computeEffectPropStatus({
			jsx: jsxElement,
			effectIndex,
			keys: effect,
		}),
	);
};

const computeSequenceOnlyPropsRecord = ({
	jsxElement,
	keys,
}: {
	jsxElement: JSXOpeningElement;
	keys: string[];
}): Record<string, CanUpdatePropStatus> => {
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

	return filteredProps;
};

export const computeSequencePropsOnlyStatus = ({
	fileName,
	nodePath,
	keys,
	remotionRoot,
}: {
	fileName: string;
	nodePath: SequenceNodePath;
	keys: string[];
	remotionRoot: string;
}): {canUpdate: true; props: Record<string, CanUpdatePropStatus>} => {
	const absolutePath = path.resolve(remotionRoot, fileName);
	const fileRelativeToRoot = path.relative(remotionRoot, absolutePath);
	if (fileRelativeToRoot.startsWith('..')) {
		throw new Error('Cannot read a file outside the project');
	}

	const fileContents = readFileSync(absolutePath, 'utf-8');
	const ast = parseAst(fileContents);
	const jsxElement = findJsxElementAtNodePath(ast, nodePath);
	if (!jsxElement) {
		throw new Error(
			'Cannot compute sequence props: Could not find a JSX element at the specified location',
		);
	}

	return {
		canUpdate: true as const,
		props: computeSequenceOnlyPropsRecord({jsxElement, keys}),
	};
};

export const computeSequencePropsStatusFromContent = ({
	fileContents,
	nodePath,
	keys,
	effects,
}: {
	fileContents: string;
	nodePath: SequenceNodePath;
	keys: string[];
	effects: string[][];
}): CanUpdateSequencePropsResponseTrue => {
	const ast = parseAst(fileContents);

	const jsxElement = findJsxElementAtNodePath(ast, nodePath);

	if (!jsxElement) {
		throw new JsxElementNotFoundAtLocationError();
	}

	const filteredProps = computeSequenceOnlyPropsRecord({jsxElement, keys});
	const effectsStatuses = computeEffectsForJsx({jsxElement, effects});

	return {
		canUpdate: true as const,
		props: filteredProps,
		effects: effectsStatuses,
	};
};

export const computeSequencePropsStatus = ({
	fileName,
	nodePath,
	keys,
	effects,
	remotionRoot,
}: {
	fileName: string;
	nodePath: SequenceNodePath;
	keys: string[];
	effects: string[][];
	remotionRoot: string;
}): CanUpdateSequencePropsResponseTrue => {
	const absolutePath = path.resolve(remotionRoot, fileName);
	const fileRelativeToRoot = path.relative(remotionRoot, absolutePath);
	if (fileRelativeToRoot.startsWith('..')) {
		throw new Error('Cannot read a file outside the project');
	}

	const fileContents = readFileSync(absolutePath, 'utf-8');
	return computeSequencePropsStatusFromContent({
		fileContents,
		nodePath,
		keys,
		effects,
	});
};

export const computeSequencePropsStatusFromFilenameByLine = ({
	fileName,
	line,
	keys,
	effects,
	remotionRoot,
	logLevel,
}: {
	fileName: string;
	line: number;
	keys: string[];
	effects: string[][];
	remotionRoot: string;
	logLevel: LogLevel;
}): SubscribeToSequencePropsResponse => {
	try {
		const absolutePath = path.resolve(remotionRoot, fileName);
		const fileRelativeToRoot = path.relative(remotionRoot, absolutePath);
		if (fileRelativeToRoot.startsWith('..')) {
			throw new Error('Cannot read a file outside the project');
		}

		const fileContents = readFileSync(absolutePath, 'utf-8');
		const ast = parseAst(fileContents);

		const resolvedNodePath = lineColumnToNodePath(ast, line);
		if (!resolvedNodePath) {
			return {
				status: {
					canUpdate: false,
					reason: 'not-found',
				},
				success: false,
			};
		}

		return {
			status: computeSequencePropsStatus({
				fileName,
				nodePath: resolvedNodePath,
				keys,
				effects,
				remotionRoot,
			}),
			nodePath: {
				absolutePath,
				nodePath: resolvedNodePath,
				sequenceKeys: keys,
				effectKeys: effects,
			},
			success: true,
		};
	} catch (err) {
		RenderInternals.Log.error({indent: false, logLevel}, err);
		return {
			status: {
				canUpdate: false as const,
				reason: 'error',
			},
			success: false,
		};
	}
};
