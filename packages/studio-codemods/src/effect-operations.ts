import type {
	ArrayExpression,
	CallExpression,
	Expression,
	File,
	JSXAttribute,
	JSXOpeningElement,
	ObjectExpression,
	ObjectProperty,
	StringLiteral,
} from '@babel/types';
import type {
	EffectClipboardParam,
	EffectClipboardPasteType,
	EffectClipboardSnapshot,
} from '@remotion/studio-shared';
import type {ExpressionKind} from 'ast-types/lib/gen/kinds';
import * as recast from 'recast';
import type {InteractivitySchema, SequenceNodePath} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {
	ensureUseCurrentFrameHook,
	findEnclosingFunctionPath,
} from './ensure-imports-and-frame-hook';
import {findJsxElementAtNodePath} from './sequence-props';
import {
	findEffectCallExpression,
	findEffectsAttr,
} from './sequence-props/can-update-effect-props';
import {
	ensureClipboardParamRemotionImports,
	getRequiredRemotionImportsForClipboardParams,
	makeClipboardParamExpression,
	type ClipboardParamRemotionLocalNames,
} from './sequence-props/clipboard-param-expression';
import {enumerateEffectArrayElements} from './sequence-props/effect-array-elements';
import {getAstNodePath} from './sequence-props/get-ast-node-path';
import {ensureNamedImport} from './sequence-props/imports';
import {parseAst, serializeAst} from './sequence-props/parse-ast';
import {parseValueExpression} from './update-nested-prop';

const b = recast.types.builders;
const identifierRegex = /^[A-Za-z_$][0-9A-Za-z_$]*$/;

/*
 * Deep-clones an AST subtree while sharing `loc` objects by reference, like
 * Babel's `cloneNode`. A runtime import of `@babel/types` is avoided because
 * it reads `process.env` at module load, which breaks browser bundles.
 */
const cloneAstValue = <T>(value: T): T => {
	if (Array.isArray(value)) {
		return value.map((item) => cloneAstValue(item)) as T;
	}

	if (value !== null && typeof value === 'object') {
		const clone: Record<string, unknown> = {};
		for (const [key, item] of Object.entries(value)) {
			clone[key] = key === 'loc' ? item : cloneAstValue(item);
		}

		return clone as T;
	}

	return value;
};

export type FormatEffectFile = (input: {contents: string}) => Promise<{
	formatted: boolean;
	output: string;
}>;

export type EffectTarget = {
	sequenceNodePath: SequenceNodePath;
	effectIndex: number;
};

export type EffectDeletionTarget = {
	sequenceNodePath: SequenceNodePath;
} & ({type: 'single-effect'; effectIndex: number} | {type: 'all-effects'});

export type EffectPropUpdate =
	| {key: string; value: unknown; defaultValue: unknown | null}
	| {
			key: string;
			effectParam: EffectClipboardParam;
			defaultValue: unknown | null;
	  };

const formatAst = (ast: File, formatFile: FormatEffectFile) =>
	formatFile({contents: serializeAst(ast)});

const getEffectsArray = (attr: JSXAttribute, action: string) => {
	if (!attr.value || attr.value.type !== 'JSXExpressionContainer') {
		throw new Error(`Cannot ${action} effect: effects prop is not an array`);
	}

	const expression = attr.value.expression as Expression;
	if (expression.type !== 'ArrayExpression') {
		throw new Error(`Cannot ${action} effect: effects prop is not an array`);
	}

	return expression;
};

const makeEffectsAttr = (array: ArrayExpression): JSXAttribute =>
	b.jsxAttribute(
		b.jsxIdentifier('effects'),
		b.jsxExpressionContainer(array as never),
	) as unknown as JSXAttribute;

const getJsx = ({
	action,
	ast,
	sequenceNodePath,
}: {
	action: string;
	ast: File;
	sequenceNodePath: SequenceNodePath;
}) => {
	const jsx = findJsxElementAtNodePath(ast, sequenceNodePath);
	if (!jsx) {
		throw new Error(
			`Could not find a JSX element at the specified location to ${action} effect`,
		);
	}

	return jsx;
};

const assertValidEffect = ({
	effectImportPath,
	effectName,
}: {
	effectImportPath: string;
	effectName: string;
}) => {
	if (!identifierRegex.test(effectName)) {
		throw new Error(`Invalid effect name "${effectName}"`);
	}

	if (
		!effectImportPath.startsWith('@remotion/effects/') &&
		effectImportPath !== '@remotion/light-leaks' &&
		effectImportPath !== '@remotion/starburst'
	) {
		throw new Error(`Unsupported effect import "${effectImportPath}"`);
	}
};

const hasTopLevelBinding = (ast: File, name: string) =>
	ast.program.body.some((node) => {
		const declaration =
			node.type === 'ExportNamedDeclaration' ? node.declaration : node;
		if (
			declaration?.type === 'ClassDeclaration' ||
			declaration?.type === 'FunctionDeclaration'
		) {
			return declaration.id?.name === name;
		}

		if (declaration?.type === 'VariableDeclaration') {
			return declaration.declarations.some(
				(item) => item.id.type === 'Identifier' && item.id.name === name,
			);
		}

		return (
			node.type === 'ImportDeclaration' &&
			node.specifiers?.some((specifier) => specifier.local?.name === name)
		);
	});

const ensureEffectImport = ({
	ast,
	effectImportPath,
	effectName,
}: {
	ast: File;
	effectImportPath: string;
	effectName: string;
}) => {
	assertValidEffect({effectImportPath, effectName});
	let localName = effectName;
	if (hasTopLevelBinding(ast, localName)) {
		localName = `${effectName}Effect`;
		let suffix = 2;
		while (hasTopLevelBinding(ast, localName)) {
			localName = `${effectName}Effect${suffix++}`;
		}
	}

	return ensureNamedImport({
		ast,
		importedName: effectName,
		localName,
		sourcePath: effectImportPath,
	});
};

const makeConfigObject = (config: Record<string, unknown>) =>
	b.objectExpression(
		Object.entries(config).map(([key, value]) =>
			b.objectProperty(
				identifierRegex.test(key) ? b.identifier(key) : b.stringLiteral(key),
				parseValueExpression(value),
			),
		) as never,
	) as ObjectExpression;

export const addEffect = async ({
	effectConfig,
	effectImportPath,
	effectName,
	formatFile,
	input,
	sequenceNodePath,
}: {
	effectConfig: Record<string, unknown>;
	effectImportPath: string;
	effectName: string;
	formatFile: FormatEffectFile;
	input: string;
	sequenceNodePath: SequenceNodePath;
}) => {
	const ast = parseAst(input);
	const jsx = getJsx({action: 'add', ast, sequenceNodePath});
	const localName = ensureEffectImport({ast, effectImportPath, effectName});
	const effectCall = b.callExpression(b.identifier(localName), [
		makeConfigObject(effectConfig) as never,
	]);
	const attr = findEffectsAttr(jsx.attributes);
	if (attr) {
		getEffectsArray(attr, 'add').elements.push(effectCall as never);
	} else {
		jsx.attributes.push(
			makeEffectsAttr(
				b.arrayExpression([effectCall as never]) as ArrayExpression,
			),
		);
	}

	const formatted = await formatAst(ast, formatFile);
	return formatted;
};

export const duplicateEffects = async ({
	effects,
	formatFile,
	input,
}: {
	effects: EffectTarget[];
	formatFile: FormatEffectFile;
	input: string;
}) => {
	if (effects.length === 0) {
		throw new Error('No effects were specified for duplication');
	}

	const ast = parseAst(input);
	const effectsByAttribute = new Map<
		JSXAttribute,
		{array: ArrayExpression; indices: Set<number>}
	>();
	for (const {effectIndex, sequenceNodePath} of effects) {
		const jsx = getJsx({action: 'duplicate', ast, sequenceNodePath});
		const attr = findEffectsAttr(jsx.attributes);
		if (!attr) {
			throw new Error('Could not find effects on the target JSX element');
		}

		const found = findEffectCallExpression({attr, effectIndex});
		if (found.kind === 'error') {
			throw new Error(`Cannot duplicate effect: ${found.reason}`);
		}

		const group = effectsByAttribute.get(attr) ?? {
			array: getEffectsArray(attr, 'duplicate'),
			indices: new Set<number>(),
		};
		group.indices.add(effectIndex);
		effectsByAttribute.set(attr, group);
	}

	for (const {array, indices} of effectsByAttribute.values()) {
		for (const effectIndex of [...indices].sort((a, bValue) => bValue - a)) {
			const effect = array.elements[effectIndex];
			if (!effect || effect.type !== 'CallExpression') {
				throw new Error('Cannot duplicate effect: not-call-expression');
			}

			array.elements.splice(effectIndex + 1, 0, cloneAstValue(effect) as never);
		}
	}

	const formatted = await formatAst(ast, formatFile);
	return formatted;
};

export const reorderEffect = async ({
	formatFile,
	fromIndex,
	input,
	sequenceNodePath,
	toIndex,
}: {
	formatFile: FormatEffectFile;
	fromIndex: number;
	input: string;
	sequenceNodePath: SequenceNodePath;
	toIndex: number;
}) => {
	const ast = parseAst(input);
	const jsx = getJsx({action: 'reorder', ast, sequenceNodePath});
	const attr = findEffectsAttr(jsx.attributes);
	if (!attr) {
		throw new Error('Could not find effects on the target JSX element');
	}

	const array = getEffectsArray(attr, 'reorder');
	const elements = enumerateEffectArrayElements(array);
	if (fromIndex < 0 || fromIndex >= elements.length) {
		throw new Error('Cannot reorder effect: source index not-found');
	}

	if (toIndex < 0 || toIndex >= elements.length) {
		throw new Error('Cannot reorder effect: target index not-found');
	}

	if (elements[fromIndex].kind !== 'call') {
		throw new Error(
			'Cannot reorder effect: source effect is not-call-expression',
		);
	}

	if (fromIndex !== toIndex) {
		const [moved] = array.elements.splice(fromIndex, 1);
		array.elements.splice(toIndex, 0, moved as never);
	}

	const formatted = await formatAst(ast, formatFile);
	return formatted;
};

export const deleteEffects = async ({
	effects,
	formatFile,
	input,
}: {
	effects: EffectDeletionTarget[];
	formatFile: FormatEffectFile;
	input: string;
}) => {
	if (effects.length === 0) {
		throw new Error('No effects were specified for deletion');
	}

	const ast = parseAst(input);
	const effectsByAttribute = new Map<
		JSXAttribute,
		{
			all: boolean;
			array: ArrayExpression;
			attributes: JSXOpeningElement['attributes'];
			indices: Set<number>;
		}
	>();
	for (const effect of effects) {
		const jsx = getJsx({
			action: 'delete',
			ast,
			sequenceNodePath: effect.sequenceNodePath,
		});
		const attr = findEffectsAttr(jsx.attributes);
		if (!attr) {
			throw new Error('Could not find effects on the target JSX element');
		}

		const group = effectsByAttribute.get(attr) ?? {
			all: false,
			array: getEffectsArray(attr, 'delete'),
			attributes: jsx.attributes,
			indices: new Set<number>(),
		};
		effectsByAttribute.set(attr, group);
		if (effect.type === 'all-effects') {
			if (group.array.elements.length === 0) {
				throw new Error('Cannot delete effect: no effects found');
			}

			group.all = true;
			group.indices.clear();
			continue;
		}

		if (!group.all && !group.indices.has(effect.effectIndex)) {
			const found = findEffectCallExpression({
				attr,
				effectIndex: effect.effectIndex,
			});
			if (found.kind === 'error') {
				throw new Error(`Cannot delete effect: ${found.reason}`);
			}

			group.indices.add(effect.effectIndex);
		}
	}

	for (const [attr, group] of effectsByAttribute) {
		if (!group.all) {
			for (const index of [...group.indices].sort((a, bValue) => bValue - a)) {
				group.array.elements.splice(index, 1);
			}
		}

		if (group.all || group.array.elements.length === 0) {
			const index = group.attributes.indexOf(attr);
			if (index !== -1) {
				group.attributes.splice(index, 1);
			}
		}
	}

	const formatted = await formatAst(ast, formatFile);
	return formatted;
};

const makeEffectCall = ({
	ast,
	effect,
	localNames,
}: {
	ast: File;
	effect: EffectClipboardSnapshot;
	localNames: ClipboardParamRemotionLocalNames;
}) => {
	const effectName = ensureEffectImport({
		ast,
		effectImportPath: effect.importPath,
		effectName: effect.callee,
	});
	const properties = Object.entries(effect.params).map(([key, param]) =>
		b.objectProperty(
			identifierRegex.test(key) ? b.identifier(key) : b.stringLiteral(key),
			makeClipboardParamExpression({param, localNames}),
		),
	) as ObjectProperty[];
	return b.callExpression(b.identifier(effectName), [
		b.objectExpression(properties as never),
	]) as CallExpression;
};

const ensureFrameHook = ({
	ast,
	localNames,
	sequenceNodePath,
}: {
	ast: File;
	localNames: ClipboardParamRemotionLocalNames;
	sequenceNodePath: SequenceNodePath;
}) => {
	const jsxPath = getAstNodePath(ast, sequenceNodePath);
	if (!jsxPath) {
		return;
	}

	const functionPath = findEnclosingFunctionPath(jsxPath);
	if (functionPath) {
		ensureUseCurrentFrameHook(
			functionPath,
			localNames.useCurrentFrame ?? 'useCurrentFrame',
		);
	}
};

export const pasteEffects = async ({
	effects,
	formatFile,
	input,
	insertAtIndices,
	targetSequenceNodePath,
	type,
}: {
	effects: EffectClipboardSnapshot[];
	formatFile: FormatEffectFile;
	input: string;
	insertAtIndices: number[] | null;
	targetSequenceNodePath: SequenceNodePath;
	type: EffectClipboardPasteType;
}) => {
	const ast = parseAst(input);
	const jsx = getJsx({
		action: 'paste',
		ast,
		sequenceNodePath: targetSequenceNodePath,
	});
	const requiredImports = getRequiredRemotionImportsForClipboardParams(
		effects.flatMap((effect) => Object.values(effect.params)),
	);
	const localNames = ensureClipboardParamRemotionImports({
		ast,
		requiredImports,
	});
	if (requiredImports.has('useCurrentFrame')) {
		ensureFrameHook({
			ast,
			localNames,
			sequenceNodePath: targetSequenceNodePath,
		});
	}

	const calls = effects.map((effect) =>
		makeEffectCall({ast, effect, localNames}),
	);
	const existingAttr = findEffectsAttr(jsx.attributes);
	if (
		insertAtIndices !== null &&
		(type !== 'effects-additive' ||
			insertAtIndices.length !== calls.length ||
			new Set(insertAtIndices).size !== insertAtIndices.length ||
			insertAtIndices.some((index) => !Number.isInteger(index) || index < 0))
	) {
		throw new Error('Cannot paste effects: invalid insertion indices');
	}

	if (type === 'effects-replacing') {
		if (existingAttr) {
			jsx.attributes.splice(jsx.attributes.indexOf(existingAttr), 1);
		}

		if (calls.length > 0) {
			jsx.attributes.push(
				makeEffectsAttr(b.arrayExpression(calls as never) as ArrayExpression),
			);
		}
	} else if (calls.length === 0) {
		throw new Error('Cannot paste effects: no effects were copied');
	} else if (insertAtIndices === null) {
		if (existingAttr) {
			getEffectsArray(existingAttr, 'paste').elements.push(
				...(calls as ArrayExpression['elements']),
			);
		} else {
			jsx.attributes.push(
				makeEffectsAttr(b.arrayExpression(calls as never) as ArrayExpression),
			);
		}
	} else {
		const elements = existingAttr
			? getEffectsArray(existingAttr, 'paste').elements
			: ([] as ArrayExpression['elements']);
		for (const item of calls
			.map((effect, index) => ({effect, index: insertAtIndices[index]!}))
			.sort((a, bValue) => a.index - bValue.index)) {
			elements.splice(Math.min(item.index, elements.length), 0, item.effect);
		}

		if (!existingAttr) {
			jsx.attributes.push(
				makeEffectsAttr(
					b.arrayExpression(elements as never) as ArrayExpression,
				),
			);
		}
	}

	const formatted = await formatAst(ast, formatFile);
	return formatted;
};

const isEffectParamUpdate = (
	update: EffectPropUpdate,
): update is Extract<EffectPropUpdate, {effectParam: EffectClipboardParam}> =>
	'effectParam' in update;

const findObjectProperty = (object: ObjectExpression, key: string) =>
	object.properties.find(
		(property): property is ObjectProperty =>
			property.type === 'ObjectProperty' &&
			((property.key.type === 'Identifier' && property.key.name === key) ||
				(property.key.type === 'StringLiteral' &&
					(property.key as StringLiteral).value === key)),
	);

const makeEffectPropExpression = ({
	ast,
	sequenceNodePath,
	update,
}: {
	ast: File;
	sequenceNodePath: SequenceNodePath;
	update: EffectPropUpdate;
}): ExpressionKind => {
	if (!isEffectParamUpdate(update)) {
		return parseValueExpression(update.value);
	}

	const requiredImports = getRequiredRemotionImportsForClipboardParams([
		update.effectParam,
	]);
	const localNames = ensureClipboardParamRemotionImports({
		ast,
		requiredImports,
	});
	if (requiredImports.has('useCurrentFrame')) {
		ensureFrameHook({ast, localNames, sequenceNodePath});
	}

	return makeClipboardParamExpression({param: update.effectParam, localNames});
};

export const updateEffectProps = async ({
	effectIndex,
	formatFile,
	input,
	schema,
	sequenceNodePath,
	update,
}: {
	effectIndex: number;
	formatFile: FormatEffectFile;
	input: string;
	schema: InteractivitySchema;
	sequenceNodePath: SequenceNodePath;
	update: EffectPropUpdate;
}) => {
	const ast = parseAst(input);
	const jsx = getJsx({action: 'update', ast, sequenceNodePath});
	const attr = findEffectsAttr(jsx.attributes);
	if (!attr) {
		throw new Error('Could not find effects on the target JSX element');
	}

	const found = findEffectCallExpression({attr, effectIndex});
	if (found.kind === 'error') {
		throw new Error(`Cannot update effect prop: ${found.reason}`);
	}

	const isDefault =
		!isEffectParamUpdate(update) &&
		update.defaultValue !== null &&
		JSON.stringify(update.value) === JSON.stringify(update.defaultValue);
	let object: ObjectExpression;
	if (found.call.arguments.length === 0) {
		if (isDefault) {
			const unchangedFormatted = await formatAst(ast, formatFile);
			return unchangedFormatted;
		}

		object = b.objectExpression([]) as ObjectExpression;
		found.call.arguments.push(object);
	} else if (found.call.arguments[0].type !== 'ObjectExpression') {
		throw new Error('Cannot update effect prop: computed');
	} else {
		object = found.call.arguments[0] as ObjectExpression;
	}

	const existing = findObjectProperty(object, update.key);
	if (isDefault) {
		if (existing) {
			object.properties.splice(object.properties.indexOf(existing), 1);
		}
	} else {
		const value = makeEffectPropExpression({ast, sequenceNodePath, update});
		if (existing) {
			existing.value = value as ObjectProperty['value'];
		} else {
			object.properties.push(
				b.objectProperty(b.identifier(update.key), value) as ObjectProperty,
			);
		}
	}

	const staticValue = isEffectParamUpdate(update)
		? update.effectParam.type === 'static'
			? update.effectParam.value
			: null
		: update.value;
	const field = schema[update.key];
	if (field?.type === 'enum' && staticValue !== null) {
		for (const key of NoReactInternals.findPropsToDelete({
			key: update.key,
			schema,
			value: staticValue,
		})) {
			const property = findObjectProperty(object, key);
			if (property) {
				object.properties.splice(object.properties.indexOf(property), 1);
			}
		}
	}

	const formatted = await formatAst(ast, formatFile);
	return formatted;
};
