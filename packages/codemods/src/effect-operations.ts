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
import {
	captureFunctionSourceSnapshots,
	getFunctionSourceEditsForPrependedStatements,
} from './function-source-edits';
import {printJsxOpeningElement} from './print-jsx';
import {recastLocToOffset} from './recast-loc-to-offset';
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
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getInsertImportSourceEdits,
	type SourceEdit,
} from './source-edits';
import {
	getIndentationUnit,
	getLineIndent,
	getSourceFormattingConfig,
	indentContinuationLines,
	printNodeWithSourceStyle,
} from './source-style';
import {parseValueExpression} from './update-nested-prop';

export {
	findEffectCallExpression,
	findEffectsAttr,
} from './sequence-props/can-update-effect-props';
export {
	enumerateEffectArrayElements,
	type EffectArrayElement,
} from './sequence-props/effect-array-elements';

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

type EffectSourceStyleOptions = {
	// Kept optional for compatibility with callers from before source edits
	// replaced the full-file formatting pass.
	formatFile?: FormatEffectFile;
	prettierConfigOverride?: Record<string, unknown> | null;
};

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

export type PropDelta = {
	key: string;
	valueString: string;
};

export type UpdateEffectPropsResult = {
	output: string;
	formatted: boolean;
	oldValueString: string;
	newValueString: string;
	logLine: number;
	effectCallee: string;
	removedProps: PropDelta[];
};

type EffectSourceSnapshots = {
	functionSnapshots: ReturnType<typeof captureFunctionSourceSnapshots>;
	importSnapshots: ReturnType<typeof captureImportSnapshots>;
	originalAttributeSources: Map<object, string>;
	openingElementLocations: Map<JSXOpeningElement, JSXOpeningElement['loc']>;
};

const captureEffectSourceSnapshots = (ast: File): EffectSourceSnapshots => ({
	functionSnapshots: captureFunctionSourceSnapshots(ast),
	importSnapshots: captureImportSnapshots(ast),
	originalAttributeSources: new Map(),
	openingElementLocations: new Map(),
});

const trackOpeningElement = ({
	jsx,
	snapshots,
}: {
	jsx: JSXOpeningElement;
	snapshots: EffectSourceSnapshots;
}) => {
	if (!snapshots.openingElementLocations.has(jsx)) {
		snapshots.openingElementLocations.set(jsx, jsx.loc);
		for (const attribute of jsx.attributes) {
			snapshots.originalAttributeSources.set(
				attribute,
				recast.print(attribute).code,
			);
		}
	}
};

const getEffectSourceOutput = ({
	ast,
	input,
	prettierConfigOverride,
	snapshots,
}: {
	ast: File;
	input: string;
	prettierConfigOverride: Record<string, unknown> | null;
	snapshots: EffectSourceSnapshots;
}) => {
	const formattingConfig = getSourceFormattingConfig({
		input,
		prettierConfigOverride,
	});
	const {coveredRanges, edits: functionEdits} =
		getFunctionSourceEditsForPrependedStatements({
			indentationUnit: formattingConfig.indentationUnit,
			input,
			printNode: (node) =>
				printNodeWithSourceStyle({
					input,
					node,
					prettierConfigOverride: formattingConfig,
					wrapColumn: formattingConfig.printWidth,
				}),
			reprintBlockBodies: new Set(),
			snapshots: snapshots.functionSnapshots,
		});
	const isCoveredByFunctionEdit = (start: number, end: number) =>
		coveredRanges.some((range) => start >= range.start && end <= range.end);
	const getJsxSourceIndent = (offset: number) => {
		const lineStart = input.lastIndexOf('\n', offset - 1) + 1;
		const startsInsideSameLineFunctionBlock = snapshots.functionSnapshots.some(
			({body}) => {
				if (body.type !== 'BlockStatement' || !body.loc) {
					return false;
				}

				const blockStart = recastLocToOffset(input, body.loc.start);
				const blockEnd = recastLocToOffset(input, body.loc.end);
				return (
					blockStart < offset &&
					offset < blockEnd &&
					input.lastIndexOf('\n', blockStart - 1) + 1 === lineStart
				);
			},
		);
		const lineIndent = getLineIndent({input, offset});
		return startsInsideSameLineFunctionBlock
			? `${lineIndent}${getIndentationUnit(input, prettierConfigOverride)}`
			: lineIndent;
	};

	const openingElementEdits: SourceEdit[] = [];
	for (const [openingElement, location] of snapshots.openingElementLocations) {
		if (!location) {
			throw new Error('Cannot update effect without a JSX source location');
		}

		const start = recastLocToOffset(input, location.start);
		const end = recastLocToOffset(input, location.end);
		if (isCoveredByFunctionEdit(start, end)) {
			continue;
		}

		const original = input.slice(start, end);
		if (recast.print(openingElement).code === original) {
			continue;
		}

		const replacement = indentContinuationLines({
			indent: getJsxSourceIndent(start),
			input,
			printed: printJsxOpeningElement({
				compactLiteralProps: false,
				openingElement: openingElement as never,
				input,
				originalAttributeSources: snapshots.originalAttributeSources,
				prettierConfigOverride: formattingConfig,
			}),
		}).replace(/^[\t ]+(?=\r?$)/gm, '');
		openingElementEdits.push({
			start,
			end,
			replacement,
		});
	}

	return applySourceEdits({
		input,
		edits: [
			...getInsertImportSourceEdits({
				ast,
				input,
				prettierConfigOverride: formattingConfig,
				snapshots: snapshots.importSnapshots,
			}),
			...functionEdits,
			...openingElementEdits,
		],
	});
};

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

export const assertValidEffect = ({
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

export const ensureEffectImport = ({
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

export const makeConfigObjectExpression = (config: Record<string, unknown>) =>
	b.objectExpression(
		Object.entries(config).map(([key, value]) =>
			b.objectProperty(
				identifierRegex.test(key) ? b.identifier(key) : b.stringLiteral(key),
				parseValueExpression(value),
			),
		) as never,
	) as ObjectExpression;

export const addEffect = ({
	effectConfig,
	effectImportPath,
	effectName,
	input,
	prettierConfigOverride,
	sequenceNodePath,
}: {
	effectConfig: Record<string, unknown>;
	effectImportPath: string;
	effectName: string;
	input: string;
	sequenceNodePath: SequenceNodePath;
} & EffectSourceStyleOptions): Promise<{
	output: string;
	formatted: boolean;
	effectLabel: string;
	nodeLabel: string;
	logLine: number;
}> =>
	Promise.resolve().then(() => {
		assertValidEffect({effectImportPath, effectName});
		const ast = parseAst(input);
		const snapshots = captureEffectSourceSnapshots(ast);
		const jsx = getJsx({action: 'add', ast, sequenceNodePath});
		trackOpeningElement({jsx, snapshots});
		const localName = ensureEffectImport({ast, effectImportPath, effectName});
		const effectCall = b.callExpression(b.identifier(localName), [
			makeConfigObjectExpression(effectConfig) as never,
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

		return {
			output: getEffectSourceOutput({
				ast,
				input,
				prettierConfigOverride: prettierConfigOverride ?? null,
				snapshots,
			}),
			formatted: true,
			effectLabel: `${effectName}()`,
			nodeLabel:
				jsx.name.type === 'JSXIdentifier' ? `<${jsx.name.name}>` : 'element',
			logLine: jsx.loc?.start.line ?? 1,
		};
	});

export const duplicateEffects = ({
	effects,
	input,
	prettierConfigOverride,
}: {
	effects: EffectTarget[];
	input: string;
} & EffectSourceStyleOptions): Promise<{
	output: string;
	formatted: boolean;
	effectLabels: string[];
	logLines: number[];
}> =>
	Promise.resolve().then(() => {
		if (effects.length === 0) {
			throw new Error('No effects were specified for duplication');
		}

		const ast = parseAst(input);
		const snapshots = captureEffectSourceSnapshots(ast);
		const effectsByAttribute = new Map<
			JSXAttribute,
			{
				array: ArrayExpression;
				indices: Set<number>;
				effectLabels: string[];
				logLines: number[];
			}
		>();
		for (const {effectIndex, sequenceNodePath} of effects) {
			const jsx = getJsx({action: 'duplicate', ast, sequenceNodePath});
			const attr = findEffectsAttr(jsx.attributes);
			if (!attr) {
				throw new Error('Could not find effects on the target JSX element');
			}

			const array = getEffectsArray(attr, 'duplicate');
			const found = findEffectCallExpression({attr, effectIndex});
			if (found.kind === 'error') {
				throw new Error(`Cannot duplicate effect: ${found.reason}`);
			}

			const group = effectsByAttribute.get(attr) ?? {
				array,
				indices: new Set<number>(),
				effectLabels: [],
				logLines: [],
			};
			effectsByAttribute.set(attr, group);
			trackOpeningElement({jsx, snapshots});
			if (group.indices.has(effectIndex)) {
				continue;
			}

			group.indices.add(effectIndex);
			group.effectLabels.push(`${found.callee}()`);
			group.logLines.push(
				found.call.loc?.start.line ?? jsx.loc?.start.line ?? 1,
			);
		}

		for (const {array, indices} of effectsByAttribute.values()) {
			for (const effectIndex of [...indices].sort((a, bValue) => bValue - a)) {
				const effect = array.elements[effectIndex];
				if (!effect || effect.type !== 'CallExpression') {
					throw new Error('Cannot duplicate effect: not-call-expression');
				}

				array.elements.splice(
					effectIndex + 1,
					0,
					cloneAstValue(effect) as never,
				);
			}
		}

		return {
			output: getEffectSourceOutput({
				ast,
				input,
				prettierConfigOverride: prettierConfigOverride ?? null,
				snapshots,
			}),
			formatted: true,
			effectLabels: [...effectsByAttribute.values()].flatMap(
				(group) => group.effectLabels,
			),
			logLines: [...effectsByAttribute.values()].flatMap(
				(group) => group.logLines,
			),
		};
	});

export const duplicateEffect = ({
	effectIndex,
	input,
	prettierConfigOverride,
	sequenceNodePath,
}: {
	effectIndex: number;
	input: string;
	sequenceNodePath: SequenceNodePath;
} & EffectSourceStyleOptions): Promise<{
	output: string;
	formatted: boolean;
	effectLabel: string;
	logLine: number;
}> =>
	duplicateEffects({
		input,
		effects: [{effectIndex, sequenceNodePath}],
		prettierConfigOverride,
	}).then(({effectLabels, formatted, logLines, output}) => ({
		output,
		formatted,
		effectLabel: effectLabels[0],
		logLine: logLines[0],
	}));

export const reorderEffect = ({
	fromIndex,
	input,
	prettierConfigOverride,
	sequenceNodePath,
	toIndex,
}: {
	fromIndex: number;
	input: string;
	sequenceNodePath: SequenceNodePath;
	toIndex: number;
} & EffectSourceStyleOptions): Promise<{
	output: string;
	formatted: boolean;
	effectLabel: string;
	logLine: number;
}> =>
	Promise.resolve().then(() => {
		const ast = parseAst(input);
		const snapshots = captureEffectSourceSnapshots(ast);
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

		const target = elements[fromIndex];
		if (target.kind !== 'call') {
			throw new Error(
				'Cannot reorder effect: source effect is not-call-expression',
			);
		}

		trackOpeningElement({jsx, snapshots});
		if (fromIndex !== toIndex) {
			const [moved] = array.elements.splice(fromIndex, 1);
			array.elements.splice(toIndex, 0, moved as never);
		}

		return {
			output: getEffectSourceOutput({
				ast,
				input,
				prettierConfigOverride: prettierConfigOverride ?? null,
				snapshots,
			}),
			formatted: true,
			effectLabel: `${target.callee}()`,
			logLine: target.node.loc?.start.line ?? jsx.loc?.start.line ?? 1,
		};
	});

export const deleteEffects = ({
	effects,
	input,
	prettierConfigOverride,
}: {
	effects: EffectDeletionTarget[];
	input: string;
} & EffectSourceStyleOptions): Promise<{
	output: string;
	formatted: boolean;
	effectLabels: string[];
	logLines: number[];
}> =>
	Promise.resolve().then(() => {
		if (effects.length === 0) {
			throw new Error('No effects were specified for deletion');
		}

		const ast = parseAst(input);
		const snapshots = captureEffectSourceSnapshots(ast);
		const effectsByAttribute = new Map<
			JSXAttribute,
			{
				all: boolean;
				array: ArrayExpression;
				attributes: JSXOpeningElement['attributes'];
				indices: Set<number>;
				effectLabels: string[];
				logLines: number[];
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
				effectLabels: [],
				logLines: [],
			};
			effectsByAttribute.set(attr, group);
			trackOpeningElement({jsx, snapshots});
			if (effect.type === 'all-effects') {
				if (group.array.elements.length === 0) {
					throw new Error('Cannot delete effect: no effects found');
				}

				const elements = enumerateEffectArrayElements(group.array);
				group.all = true;
				group.indices.clear();
				group.effectLabels = elements.map((element) =>
					element.kind === 'call' ? `${element.callee}()` : 'effect',
				);
				group.logLines = elements.map((element) =>
					element.kind === 'call'
						? (element.node.loc?.start.line ?? attr.loc?.start.line ?? 1)
						: (attr.loc?.start.line ?? 1),
				);
				continue;
			}

			if (group.all || group.indices.has(effect.effectIndex)) {
				continue;
			}

			const found = findEffectCallExpression({
				attr,
				effectIndex: effect.effectIndex,
			});
			if (found.kind === 'error') {
				throw new Error(`Cannot delete effect: ${found.reason}`);
			}

			group.indices.add(effect.effectIndex);
			group.effectLabels.push(`${found.callee}()`);
			group.logLines.push(
				found.call.loc?.start.line ?? jsx.loc?.start.line ?? 1,
			);
		}

		for (const [attr, group] of effectsByAttribute) {
			if (!group.all) {
				for (const index of [...group.indices].sort(
					(a, bValue) => bValue - a,
				)) {
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

		return {
			output: getEffectSourceOutput({
				ast,
				input,
				prettierConfigOverride: prettierConfigOverride ?? null,
				snapshots,
			}),
			formatted: true,
			effectLabels: [...effectsByAttribute.values()].flatMap(
				(group) => group.effectLabels,
			),
			logLines: [...effectsByAttribute.values()].flatMap(
				(group) => group.logLines,
			),
		};
	});

export const deleteEffect = ({
	effectIndex,
	input,
	prettierConfigOverride,
	sequenceNodePath,
}: {
	effectIndex: number;
	input: string;
	sequenceNodePath: SequenceNodePath;
} & EffectSourceStyleOptions): Promise<{
	output: string;
	formatted: boolean;
	effectLabel: string;
	logLine: number;
}> =>
	deleteEffects({
		input,
		effects: [{type: 'single-effect', effectIndex, sequenceNodePath}],
		prettierConfigOverride,
	}).then(({effectLabels, formatted, logLines, output}) => ({
		output,
		formatted,
		effectLabel: effectLabels[0],
		logLine: logLines[0],
	}));

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

export const pasteEffects = ({
	effects,
	input,
	insertAtIndices,
	prettierConfigOverride,
	targetSequenceNodePath,
	type,
}: {
	effects: EffectClipboardSnapshot[];
	input: string;
	insertAtIndices: number[] | null;
	targetSequenceNodePath: SequenceNodePath;
	type: EffectClipboardPasteType;
} & EffectSourceStyleOptions): Promise<{
	output: string;
	formatted: boolean;
	effectLabels: string[];
	logLine: number;
}> =>
	Promise.resolve().then(() => {
		const ast = parseAst(input);
		const snapshots = captureEffectSourceSnapshots(ast);
		const jsx = getJsx({
			action: 'paste',
			ast,
			sequenceNodePath: targetSequenceNodePath,
		});
		trackOpeningElement({jsx, snapshots});
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

		return {
			output: getEffectSourceOutput({
				ast,
				input,
				prettierConfigOverride: prettierConfigOverride ?? null,
				snapshots,
			}),
			formatted: true,
			effectLabels: effects.map((effect) => `${effect.callee}()`),
			logLine: jsx.loc?.start.line ?? 1,
		};
	});

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

const printObjectPropertyValue = (property: ObjectProperty) =>
	recast
		.print(property.value)
		.code.replace(/[\n\r\t]+/g, ' ')
		.replace(/,(\s*[}\]])/g, '$1')
		.trim();

const removeObjectProperty = ({
	key,
	object,
}: {
	key: string;
	object: ObjectExpression;
}): PropDelta | null => {
	const property = findObjectProperty(object, key);
	if (!property) {
		return null;
	}

	object.properties.splice(object.properties.indexOf(property), 1);
	return {key, valueString: printObjectPropertyValue(property)};
};

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

export const updateEffectPropsAst = ({
	effectIndex,
	input,
	prettierConfigOverride,
	schema,
	sequenceNodePath,
	update,
}: {
	effectIndex: number;
	input: string;
	prettierConfigOverride?: Record<string, unknown> | null;
	schema: InteractivitySchema;
	sequenceNodePath: SequenceNodePath;
	update: EffectPropUpdate;
}): {
	serialized: string;
	oldValueString: string;
	newValueString: string;
	logLine: number;
	effectCallee: string;
	removedProps: PropDelta[];
} => {
	const ast = parseAst(input);
	const snapshots = captureEffectSourceSnapshots(ast);
	const jsx = getJsx({action: 'update', ast, sequenceNodePath});
	trackOpeningElement({jsx, snapshots});
	const attr = findEffectsAttr(jsx.attributes);
	if (!attr) {
		throw new Error('Could not find effects on the target JSX element');
	}

	const found = findEffectCallExpression({attr, effectIndex});
	if (found.kind === 'error') {
		throw new Error(`Cannot update effect prop: ${found.reason}`);
	}

	const {call, callee: effectCallee} = found;
	const isDefault =
		!isEffectParamUpdate(update) &&
		update.defaultValue !== null &&
		JSON.stringify(update.value) === JSON.stringify(update.defaultValue);
	let object: ObjectExpression;
	if (call.arguments.length === 0) {
		if (isDefault) {
			return {
				serialized: input,
				oldValueString: '',
				newValueString: JSON.stringify(update.defaultValue),
				logLine: call.loc?.start.line ?? jsx.loc?.start.line ?? 1,
				effectCallee,
				removedProps: [],
			};
		}

		object = b.objectExpression([]) as ObjectExpression;
		call.arguments.push(object);
	} else if (call.arguments[0].type !== 'ObjectExpression') {
		throw new Error('Cannot update effect prop: computed');
	} else {
		object = call.arguments[0] as ObjectExpression;
	}

	const existing = findObjectProperty(object, update.key);
	let oldValueString = '';
	if (existing) {
		oldValueString = recast.print(existing.value).code;
	} else if (update.defaultValue !== null) {
		oldValueString = JSON.stringify(update.defaultValue);
	}

	let newValueString = '';
	if (isDefault) {
		newValueString = JSON.stringify(update.defaultValue);
		if (existing) {
			object.properties.splice(object.properties.indexOf(existing), 1);
		}
	} else {
		const value = makeEffectPropExpression({ast, sequenceNodePath, update});
		newValueString = recast.print(value).code;
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
	const removedProps: PropDelta[] = [];
	if (field?.type === 'enum' && staticValue !== null) {
		for (const key of NoReactInternals.findPropsToDelete({
			key: update.key,
			schema,
			value: staticValue,
		})) {
			const removed = removeObjectProperty({key, object});
			if (removed) {
				removedProps.push(removed);
			}
		}
	}

	return {
		serialized: getEffectSourceOutput({
			ast,
			input,
			prettierConfigOverride: prettierConfigOverride ?? null,
			snapshots,
		}),
		oldValueString,
		newValueString,
		logLine: call.loc?.start.line ?? jsx.loc?.start.line ?? 1,
		effectCallee,
		removedProps,
	};
};

export const updateEffectProps = ({
	effectIndex,
	input,
	prettierConfigOverride,
	schema,
	sequenceNodePath,
	update,
}: {
	effectIndex: number;
	input: string;
	schema: InteractivitySchema;
	sequenceNodePath: SequenceNodePath;
	update: EffectPropUpdate;
} & EffectSourceStyleOptions): Promise<UpdateEffectPropsResult> =>
	Promise.resolve().then(() => {
		const {
			serialized,
			oldValueString,
			newValueString,
			logLine,
			effectCallee,
			removedProps,
		} = updateEffectPropsAst({
			input,
			sequenceNodePath,
			effectIndex,
			update,
			schema,
			prettierConfigOverride,
		});

		return {
			output: serialized,
			formatted: true,
			oldValueString,
			newValueString,
			logLine,
			effectCallee,
			removedProps,
		};
	});
