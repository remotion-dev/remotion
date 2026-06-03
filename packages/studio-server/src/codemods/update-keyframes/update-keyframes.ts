import type {
	CallExpression,
	Expression,
	JSXAttribute,
	JSXElement,
	JSXExpressionContainer,
	JSXFragment,
	JSXSpreadAttribute,
	ObjectExpression,
	ObjectProperty,
	StringLiteral,
} from '@babel/types';
import {
	getKeyframeInterpolationFunction,
	getKeyframeInterpolationFunctionForSchemaField,
	isKeyframeInterpolationFunction,
	isSchemaFieldKeyframable,
	type KeyframeInterpolationFunction,
} from '@remotion/studio-shared';
import type {ExpressionKind, SpreadElementKind} from 'ast-types/lib/gen/kinds';
import * as recast from 'recast';
import type {
	SequenceFieldSchema,
	SequenceNodePath,
	SequenceSchema,
} from 'remotion';
import {getAstNodePath} from '../../helpers/get-ast-node-path';
import {
	extractStaticValue,
	findJsxElementAtNodePath,
	findNodePathForJsxElement,
	isStaticValue,
} from '../../preview-server/routes/can-update-sequence-props';
import {formatFileContent} from '../format-file-content';
import {parseAst, serializeAst} from '../parse-ast';
import {
	findEffectCallExpression,
	findEffectsAttr,
} from '../update-effect-props/update-effect-props';
import {parseValueExpression} from '../update-nested-prop';
import {
	ensureRemotionImports,
	ensureUseCurrentFrameHook,
	findEnclosingFunctionPath,
} from './ensure-imports-and-frame-hook';

const b = recast.types.builders;

export type KeyframeOperation =
	| {
			type: 'add';
			frame: number;
			value: unknown;
	  }
	| {
			type: 'remove';
			frame: number;
	  }
	| {
			type: 'move';
			fromFrame: number;
			toFrame: number;
	  };

export type SequenceKeyframeUpdate = {
	key: string;
	operation: KeyframeOperation;
};

export type EffectKeyframeUpdate = {
	key: string;
	operation: KeyframeOperation;
};

type WritableProp = {
	expression: Expression;
	setExpression: (expression: ExpressionKind) => void;
};

type MissingPropInitialValue = {
	value: unknown;
};

type InterpolateKeyframe = {
	frame: number;
	output: ExpressionKind;
	value: unknown;
};

type InterpolateExpression = {
	callee: ExpressionKind;
	input: ExpressionKind | SpreadElementKind;
	extraArgs: (ExpressionKind | SpreadElementKind)[];
	keyframes: InterpolateKeyframe[];
};

const getSupportedCallArgument = (
	arg: CallExpression['arguments'][number] | undefined,
): ExpressionKind | SpreadElementKind | null => {
	if (
		arg === undefined ||
		arg.type === 'ArgumentPlaceholder' ||
		arg.type === 'JSXNamespacedName'
	) {
		return null;
	}

	return arg as unknown as ExpressionKind | SpreadElementKind;
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

const getInterpolationExpression = (
	node: Expression,
): InterpolateExpression | null => {
	if (node.type === 'TSAsExpression') {
		return getInterpolationExpression(node.expression as Expression);
	}

	if (
		node.type !== 'CallExpression' ||
		node.callee.type !== 'Identifier' ||
		!isKeyframeInterpolationFunction(node.callee.name)
	) {
		return null;
	}

	const frameArg = getSupportedCallArgument(node.arguments[0]);
	const inputArg = node.arguments[1];
	const outputArg = node.arguments[2];
	if (
		!frameArg ||
		!inputArg ||
		!outputArg ||
		inputArg.type !== 'ArrayExpression' ||
		outputArg.type !== 'ArrayExpression' ||
		inputArg.elements.length !== outputArg.elements.length
	) {
		return null;
	}

	const keyframes: InterpolateKeyframe[] = [];
	for (let i = 0; i < inputArg.elements.length; i++) {
		const inputElement = inputArg.elements[i];
		const outputElement = outputArg.elements[i];
		if (
			!inputElement ||
			!outputElement ||
			inputElement.type === 'SpreadElement' ||
			outputElement.type === 'SpreadElement'
		) {
			return null;
		}

		const frame = getNumericValue(inputElement);
		if (frame === null || !isStaticValue(outputElement)) {
			return null;
		}

		keyframes.push({
			frame,
			output: outputElement as ExpressionKind,
			value: extractStaticValue(outputElement),
		});
	}

	if (keyframes.length === 0) {
		return null;
	}

	const extraArgs: (ExpressionKind | SpreadElementKind)[] = [];
	for (const arg of node.arguments.slice(3)) {
		const supportedArg = getSupportedCallArgument(arg);
		if (!supportedArg) {
			return null;
		}

		extraArgs.push(supportedArg);
	}

	return {
		callee: node.callee as unknown as ExpressionKind,
		input: frameArg,
		extraArgs,
		keyframes,
	};
};

const getInterpolationCalleeForValues = ({
	schema,
	key,
	staticValue,
	newValue,
}: {
	schema: SequenceSchema | null;
	key: string;
	staticValue: unknown;
	newValue: unknown;
}): ExpressionKind => {
	return b.identifier(
		getKeyframeInterpolationFunction({
			schema,
			key,
			staticValue,
			newValue,
		}),
	);
};

const createFrameExpression = (frame: number): ExpressionKind => {
	return parseValueExpression(frame);
};

const createClampOptionsExpression = (): ExpressionKind => {
	return b.objectExpression([
		b.objectProperty(b.identifier('extrapolateLeft'), b.stringLiteral('clamp')),
		b.objectProperty(
			b.identifier('extrapolateRight'),
			b.stringLiteral('clamp'),
		),
	]) as ExpressionKind;
};

const createInterpolateExpression = ({
	callee,
	input,
	extraArgs,
	keyframes,
}: {
	callee: ExpressionKind;
	input: ExpressionKind | SpreadElementKind;
	extraArgs: (ExpressionKind | SpreadElementKind)[];
	keyframes: InterpolateKeyframe[];
}): ExpressionKind => {
	const sortedKeyframes = [...keyframes].sort(
		(first, second) => first.frame - second.frame,
	);
	return b.callExpression(callee, [
		input,
		b.arrayExpression(
			sortedKeyframes.map((keyframe) => createFrameExpression(keyframe.frame)),
		),
		b.arrayExpression(sortedKeyframes.map((keyframe) => keyframe.output)),
		...extraArgs,
	]) as ExpressionKind;
};

export type IntroducedKeyframeIdentifiers = {
	calleeName: KeyframeInterpolationFunction | null;
	needsFrameHook: boolean;
};

const noIntroducedIdentifiers: IntroducedKeyframeIdentifiers = {
	calleeName: null,
	needsFrameHook: false,
};

const addKeyframe = ({
	expression,
	key,
	frame,
	value,
	schema,
}: {
	expression: Expression;
	key: string;
	frame: number;
	value: unknown;
	schema: SequenceSchema | null;
}): {expression: ExpressionKind; introduced: IntroducedKeyframeIdentifiers} => {
	if (!isSchemaFieldKeyframable({schema, key})) {
		throw new Error(`Cannot add keyframe: "${key}" is not keyframable`);
	}

	const existing = getInterpolationExpression(expression);
	const newOutput = parseValueExpression(value);

	if (existing) {
		const existingCalleeName =
			existing.callee.type === 'Identifier'
				? (existing.callee.name as KeyframeInterpolationFunction)
				: 'interpolate';
		const schemaCalleeName = getKeyframeInterpolationFunctionForSchemaField({
			schema,
			key,
		});
		const nextCalleeName = schemaCalleeName ?? existingCalleeName;
		const existingIndex = existing.keyframes.findIndex(
			(keyframe) => keyframe.frame === frame,
		);
		const nextKeyframes =
			existingIndex === -1
				? [...existing.keyframes, {frame, output: newOutput, value}]
				: existing.keyframes.map((keyframe, index) =>
						index === existingIndex
							? {frame, output: newOutput, value}
							: keyframe,
					);

		return {
			expression: createInterpolateExpression({
				callee: b.identifier(nextCalleeName),
				input: existing.input,
				extraArgs: existing.extraArgs,
				keyframes: nextKeyframes,
			}),
			introduced: {
				calleeName:
					schemaCalleeName && schemaCalleeName !== existingCalleeName
						? schemaCalleeName
						: null,
				needsFrameHook: false,
			},
		};
	}

	if (!isStaticValue(expression)) {
		throw new Error('Cannot add keyframe to computed expression');
	}

	const staticValue = extractStaticValue(expression);
	const keyframes: InterpolateKeyframe[] = [{frame, output: newOutput, value}];

	const callee = getInterpolationCalleeForValues({
		schema,
		key,
		staticValue,
		newValue: value,
	});
	const extraArgs =
		callee.type === 'Identifier' && callee.name === 'interpolateColors'
			? []
			: [createClampOptionsExpression()];

	return {
		expression: createInterpolateExpression({
			callee,
			input: b.identifier('frame'),
			extraArgs,
			keyframes,
		}),
		introduced: {
			calleeName:
				callee.type === 'Identifier'
					? (callee.name as KeyframeInterpolationFunction)
					: null,
			needsFrameHook: true,
		},
	};
};

const removeKeyframe = ({
	expression,
	frame,
}: {
	expression: Expression;
	frame: number;
}): ExpressionKind => {
	const existing = getInterpolationExpression(expression);
	if (!existing) {
		throw new Error('Cannot remove keyframe from non-interpolated expression');
	}

	const keyframeIndex = existing.keyframes.findIndex(
		(keyframe) => keyframe.frame === frame,
	);
	if (keyframeIndex === -1) {
		throw new Error(`Cannot remove keyframe at frame ${frame}: not found`);
	}

	const nextKeyframes = existing.keyframes.filter(
		(_keyframe, index) => index !== keyframeIndex,
	);

	if (nextKeyframes.length === 0) {
		return existing.keyframes[keyframeIndex].output;
	}

	return createInterpolateExpression({
		callee: existing.callee,
		input: existing.input,
		extraArgs: existing.extraArgs,
		keyframes: nextKeyframes,
	});
};

const moveKeyframe = ({
	expression,
	fromFrame,
	toFrame,
}: {
	expression: Expression;
	fromFrame: number;
	toFrame: number;
}): ExpressionKind => {
	if (fromFrame === toFrame) {
		return expression as ExpressionKind;
	}

	const existing = getInterpolationExpression(expression);
	if (!existing) {
		throw new Error('Cannot move keyframe in non-interpolated expression');
	}

	const keyframeIndex = existing.keyframes.findIndex(
		(keyframe) => keyframe.frame === fromFrame,
	);
	if (keyframeIndex === -1) {
		throw new Error(`Cannot move keyframe at frame ${fromFrame}: not found`);
	}

	const collision = existing.keyframes.some(
		(keyframe) => keyframe.frame === toFrame,
	);
	if (collision) {
		throw new Error(`Cannot move keyframe to frame ${toFrame}: already exists`);
	}

	return createInterpolateExpression({
		callee: existing.callee,
		input: existing.input,
		extraArgs: existing.extraArgs,
		keyframes: existing.keyframes.map((keyframe, index) =>
			index === keyframeIndex ? {...keyframe, frame: toFrame} : keyframe,
		),
	});
};

const applyKeyframeOperation = ({
	expression,
	key,
	operation,
	schema,
}: {
	expression: Expression;
	key: string;
	operation: KeyframeOperation;
	schema: SequenceSchema | null;
}): {expression: ExpressionKind; introduced: IntroducedKeyframeIdentifiers} => {
	if (operation.type === 'add') {
		return addKeyframe({
			expression,
			key,
			frame: operation.frame,
			value: operation.value,
			schema,
		});
	}

	if (operation.type === 'move') {
		return {
			expression: moveKeyframe({
				expression,
				fromFrame: operation.fromFrame,
				toFrame: operation.toFrame,
			}),
			introduced: noIntroducedIdentifiers,
		};
	}

	return {
		expression: removeKeyframe({expression, frame: operation.frame}),
		introduced: noIntroducedIdentifiers,
	};
};

const getExpressionFromJsxAttribute = (
	attr: JSXAttribute,
): Expression | null => {
	if (!attr.value) {
		return b.booleanLiteral(true) as Expression;
	}

	if (attr.value.type === 'StringLiteral') {
		return attr.value as unknown as Expression;
	}

	if (attr.value.type !== 'JSXExpressionContainer') {
		return null;
	}

	const {expression} = attr.value;
	if (expression.type === 'JSXEmptyExpression') {
		return null;
	}

	return expression as Expression;
};

const findJsxAttribute = (
	attributes: (JSXAttribute | JSXSpreadAttribute)[],
	name: string,
): {attrIndex: number; attr: JSXAttribute | undefined} => {
	const attrIndex = attributes.findIndex((candidate) => {
		if (candidate.type === 'JSXSpreadAttribute') {
			return false;
		}

		if (candidate.name.type === 'JSXNamespacedName') {
			return false;
		}

		return candidate.name.name === name;
	});

	const foundAttr = attrIndex === -1 ? undefined : attributes[attrIndex];
	return {
		attrIndex,
		attr:
			foundAttr && foundAttr.type === 'JSXAttribute'
				? (foundAttr as JSXAttribute)
				: undefined,
	};
};

const findObjectProperty = (
	objExpr: ObjectExpression,
	propertyName: string,
): {propIndex: number; prop: ObjectProperty | undefined} => {
	const propIndex = objExpr.properties.findIndex(
		(prop) =>
			prop.type === 'ObjectProperty' &&
			((prop.key.type === 'Identifier' && prop.key.name === propertyName) ||
				(prop.key.type === 'StringLiteral' && prop.key.value === propertyName)),
	);

	return {
		propIndex,
		prop:
			propIndex === -1
				? undefined
				: (objExpr.properties[propIndex] as ObjectProperty),
	};
};

const findFieldInSchema = (
	schema: SequenceSchema,
	key: string,
): SequenceFieldSchema | undefined => {
	if (key in schema) {
		return schema[key];
	}

	for (const field of Object.values(schema)) {
		if (field.type !== 'enum') {
			continue;
		}

		for (const variant of Object.values(field.variants)) {
			const found = findFieldInSchema(variant, key);
			if (found) {
				return found;
			}
		}
	}

	return undefined;
};

const getInitialValueForMissingProp = ({
	schema,
	key,
	newValue,
}: {
	schema: SequenceSchema | null;
	key: string;
	newValue: unknown;
}): unknown => {
	const field = schema ? findFieldInSchema(schema, key) : undefined;
	if (field && field.type !== 'hidden' && field.default !== undefined) {
		return field.default;
	}

	return newValue;
};

const getObjectExpression = (attr: JSXAttribute): ObjectExpression | null => {
	if (!attr.value || attr.value.type !== 'JSXExpressionContainer') {
		return null;
	}

	if (attr.value.expression.type !== 'ObjectExpression') {
		return null;
	}

	return attr.value.expression as ObjectExpression;
};

const createJsxExpressionAttribute = (
	key: string,
	expression: ExpressionKind,
): JSXAttribute => {
	return b.jsxAttribute(
		b.jsxIdentifier(key),
		b.jsxExpressionContainer(expression),
	) as JSXAttribute;
};

const createObjectProperty = (key: string, value: ExpressionKind) =>
	b.objectProperty(b.identifier(key), value);

const createObjectExpressionAttribute = ({
	parentKey,
	childKey,
	expression,
}: {
	parentKey: string;
	childKey: string;
	expression: ExpressionKind;
}): JSXAttribute => {
	return createJsxExpressionAttribute(
		parentKey,
		b.objectExpression([
			createObjectProperty(childKey, expression),
		]) as ExpressionKind,
	);
};

const createMissingPropExpression = (
	missingPropInitialValue: MissingPropInitialValue,
): Expression => {
	return parseValueExpression(missingPropInitialValue.value) as Expression;
};

const getSequenceWritableProp = ({
	attributes,
	key,
	missingPropInitialValue,
}: {
	attributes: (JSXAttribute | JSXSpreadAttribute)[];
	key: string;
	missingPropInitialValue: MissingPropInitialValue | null;
}): WritableProp => {
	const dotIndex = key.indexOf('.');
	if (dotIndex === -1) {
		const {attr: topLevelAttr} = findJsxAttribute(attributes, key);
		if (!topLevelAttr) {
			if (missingPropInitialValue) {
				return {
					expression: createMissingPropExpression(missingPropInitialValue),
					setExpression: (nextExpression) => {
						attributes.push(createJsxExpressionAttribute(key, nextExpression));
					},
				};
			}

			throw new Error(`Cannot update keyframes: "${key}" is not set`);
		}

		const expression = getExpressionFromJsxAttribute(topLevelAttr);
		if (!expression) {
			throw new Error(`Cannot update keyframes: "${key}" is computed`);
		}

		return {
			expression,
			setExpression: (nextExpression) => {
				topLevelAttr.value = b.jsxExpressionContainer(nextExpression) as
					| JSXElement
					| JSXExpressionContainer
					| JSXFragment
					| StringLiteral
					| null
					| undefined;
			},
		};
	}

	const parentKey = key.slice(0, dotIndex);
	const childKey = key.slice(dotIndex + 1);
	const {attr: parentAttr} = findJsxAttribute(attributes, parentKey);
	if (!parentAttr) {
		if (missingPropInitialValue) {
			return {
				expression: createMissingPropExpression(missingPropInitialValue),
				setExpression: (nextExpression) => {
					attributes.push(
						createObjectExpressionAttribute({
							parentKey,
							childKey,
							expression: nextExpression,
						}),
					);
				},
			};
		}

		throw new Error(`Cannot update keyframes: "${parentKey}" is not set`);
	}

	const objExpr = getObjectExpression(parentAttr);
	if (!objExpr) {
		throw new Error(`Cannot update keyframes: "${parentKey}" is computed`);
	}

	const {prop} = findObjectProperty(objExpr, childKey);
	if (!prop) {
		if (missingPropInitialValue) {
			return {
				expression: createMissingPropExpression(missingPropInitialValue),
				setExpression: (nextExpression) => {
					objExpr.properties.push(
						createObjectProperty(childKey, nextExpression) as ObjectProperty,
					);
				},
			};
		}

		throw new Error(`Cannot update keyframes: "${key}" is not set`);
	}

	return {
		expression: prop.value as Expression,
		setExpression: (nextExpression) => {
			prop.value = nextExpression as ObjectProperty['value'];
		},
	};
};

export const updateSequenceKeyframesAst = ({
	input,
	nodePath,
	updates,
	schema,
}: {
	input: string;
	nodePath: SequenceNodePath;
	updates: SequenceKeyframeUpdate[];
	schema?: SequenceSchema;
}): {
	serialized: string;
	oldValueStrings: string[];
	newValueStrings: string[];
	logLine: number;
	updatedNodePath: SequenceNodePath;
} => {
	const ast = parseAst(input);
	const jsxPath = getAstNodePath(ast, nodePath);
	const node = findJsxElementAtNodePath(ast, nodePath);
	if (!node || !jsxPath) {
		throw new Error(
			'Could not find a JSX element at the specified location to update keyframes',
		);
	}

	if (!node.attributes) {
		node.attributes = [];
	}

	const requiredImports = new Set<string>();
	let needsFrameHook = false;

	const oldValueStrings: string[] = [];
	const newValueStrings: string[] = [];
	for (const update of updates) {
		const prop = getSequenceWritableProp({
			attributes: node.attributes,
			key: update.key,
			missingPropInitialValue:
				update.operation.type === 'add'
					? {
							value: getInitialValueForMissingProp({
								schema: schema ?? null,
								key: update.key,
								newValue: update.operation.value,
							}),
						}
					: null,
		});
		oldValueStrings.push(recast.print(prop.expression).code);
		const {expression: nextExpression, introduced} = applyKeyframeOperation({
			expression: prop.expression,
			key: update.key,
			operation: update.operation,
			schema: schema ?? null,
		});
		newValueStrings.push(recast.print(nextExpression).code);
		prop.setExpression(nextExpression);

		if (introduced.calleeName) {
			requiredImports.add(introduced.calleeName);
		}

		if (introduced.needsFrameHook) {
			requiredImports.add('useCurrentFrame');
			needsFrameHook = true;
		}
	}

	if (needsFrameHook) {
		const fnPath = findEnclosingFunctionPath(jsxPath);
		if (fnPath) {
			ensureUseCurrentFrameHook(fnPath);
		}
	}

	ensureRemotionImports(ast, requiredImports);

	const updatedNodePath = findNodePathForJsxElement(ast, node);
	if (!updatedNodePath) {
		throw new Error(
			'Could not find updated JSX element location after updating keyframes',
		);
	}

	return {
		serialized: serializeAst(ast),
		oldValueStrings,
		newValueStrings,
		logLine: node.loc?.start.line ?? 1,
		updatedNodePath,
	};
};

export const updateSequenceKeyframes = async ({
	input,
	nodePath,
	updates,
	schema,
	prettierConfigOverride,
}: {
	input: string;
	nodePath: SequenceNodePath;
	updates: SequenceKeyframeUpdate[];
	schema?: SequenceSchema;
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{
	output: string;
	formatted: boolean;
	oldValueStrings: string[];
	newValueStrings: string[];
	logLine: number;
	updatedNodePath: SequenceNodePath;
}> => {
	const {
		serialized,
		oldValueStrings,
		newValueStrings,
		logLine,
		updatedNodePath,
	} = updateSequenceKeyframesAst({
		input,
		nodePath,
		updates,
		schema,
	});
	const {output, formatted} = await formatFileContent({
		input: serialized,
		prettierConfigOverride,
	});

	return {
		output,
		formatted,
		oldValueStrings,
		newValueStrings,
		logLine,
		updatedNodePath,
	};
};

export const updateEffectKeyframesAst = ({
	input,
	sequenceNodePath,
	effectIndex,
	updates,
	schema,
}: {
	input: string;
	sequenceNodePath: SequenceNodePath;
	effectIndex: number;
	updates: EffectKeyframeUpdate[];
	schema?: SequenceSchema;
}): {
	serialized: string;
	oldValueStrings: string[];
	newValueStrings: string[];
	logLine: number;
	effectCallee: string;
	updatedSequenceNodePath: SequenceNodePath;
} => {
	const ast = parseAst(input);
	const jsxPath = getAstNodePath(ast, sequenceNodePath);
	const jsx = findJsxElementAtNodePath(ast, sequenceNodePath);
	if (!jsx || !jsxPath) {
		throw new Error(
			'Could not find a JSX element at the specified location to update effect keyframes',
		);
	}

	const attr = findEffectsAttr(jsx.attributes ?? []);
	if (!attr) {
		throw new Error('Could not find effects on the target JSX element');
	}

	const found = findEffectCallExpression({attr, effectIndex});
	if (found.kind === 'error') {
		throw new Error(`Cannot update effect keyframe: ${found.reason}`);
	}

	const {call, callee: effectCallee} = found;
	if (
		call.arguments.length === 0 ||
		call.arguments[0].type !== 'ObjectExpression'
	) {
		throw new Error('Cannot update effect keyframe: computed');
	}

	const objExpr = call.arguments[0] as ObjectExpression;
	const oldValueStrings: string[] = [];
	const newValueStrings: string[] = [];
	const requiredImports = new Set<string>();
	let needsFrameHook = false;
	for (const update of updates) {
		const {prop} = findObjectProperty(objExpr, update.key);
		if (!prop) {
			throw new Error(`Cannot update keyframes: "${update.key}" is not set`);
		}

		oldValueStrings.push(recast.print(prop.value).code);
		const {expression: nextExpression, introduced} = applyKeyframeOperation({
			expression: prop.value as Expression,
			key: update.key,
			operation: update.operation,
			schema: schema ?? null,
		});
		newValueStrings.push(recast.print(nextExpression).code);
		prop.value = nextExpression as ObjectProperty['value'];

		if (introduced.calleeName) {
			requiredImports.add(introduced.calleeName);
		}

		if (introduced.needsFrameHook) {
			requiredImports.add('useCurrentFrame');
			needsFrameHook = true;
		}
	}

	if (needsFrameHook) {
		const fnPath = findEnclosingFunctionPath(jsxPath);
		if (fnPath) {
			ensureUseCurrentFrameHook(fnPath);
		}
	}

	ensureRemotionImports(ast, requiredImports);

	const updatedSequenceNodePath = findNodePathForJsxElement(ast, jsx);
	if (!updatedSequenceNodePath) {
		throw new Error(
			'Could not find updated JSX element location after updating effect keyframes',
		);
	}

	return {
		serialized: serializeAst(ast),
		oldValueStrings,
		newValueStrings,
		logLine: call.loc?.start.line ?? jsx.loc?.start.line ?? 1,
		effectCallee,
		updatedSequenceNodePath,
	};
};

export const updateEffectKeyframes = async ({
	input,
	sequenceNodePath,
	effectIndex,
	updates,
	schema,
	prettierConfigOverride,
}: {
	input: string;
	sequenceNodePath: SequenceNodePath;
	effectIndex: number;
	updates: EffectKeyframeUpdate[];
	schema?: SequenceSchema;
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{
	output: string;
	formatted: boolean;
	oldValueStrings: string[];
	newValueStrings: string[];
	logLine: number;
	effectCallee: string;
	updatedSequenceNodePath: SequenceNodePath;
}> => {
	const {
		serialized,
		oldValueStrings,
		newValueStrings,
		logLine,
		effectCallee,
		updatedSequenceNodePath,
	} = updateEffectKeyframesAst({
		input,
		sequenceNodePath,
		effectIndex,
		updates,
		schema,
	});
	const {output, formatted} = await formatFileContent({
		input: serialized,
		prettierConfigOverride,
	});

	return {
		output,
		formatted,
		oldValueStrings,
		newValueStrings,
		logLine,
		effectCallee,
		updatedSequenceNodePath,
	};
};
