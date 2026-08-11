import type {
	ArrayExpression,
	CallExpression,
	JSXAttribute,
	ObjectExpression,
	ObjectProperty,
} from '@babel/types';
import type {
	EffectClipboardPasteType,
	EffectClipboardSnapshot,
} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {getAstNodePath} from '../helpers/get-ast-node-path';
import {findJsxElementAtNodePath} from '../preview-server/routes/can-update-sequence-props';
import {assertValidEffect, ensureEffectImport} from './add-effect';
import {
	ensureRemotionImportLocalNames,
	getRequiredRemotionImports,
	makeParamExpression,
	type RemotionLocalNames,
} from './effect-param-expression';
import {formatFileContent} from './format-file-content';
import {parseAst, serializeAst} from './parse-ast';
import {findEffectsAttr} from './update-effect-props/update-effect-props';
import {
	ensureUseCurrentFrameHook,
	findEnclosingFunctionPath,
} from './update-keyframes/ensure-imports-and-frame-hook';

const b = recast.types.builders;
const identifierRegex = /^[A-Za-z_$][0-9A-Za-z_$]*$/;

const getEffectsArray = (attr: JSXAttribute): ArrayExpression => {
	if (!attr.value || attr.value.type !== 'JSXExpressionContainer') {
		throw new Error('Cannot append effects: effects prop is not an array');
	}

	const expr = attr.value.expression;
	if (expr.type !== 'ArrayExpression') {
		throw new Error('Cannot append effects: effects prop is not an array');
	}

	return expr;
};

const makeEffectsAttr = (array: ArrayExpression): JSXAttribute => {
	return b.jsxAttribute(
		b.jsxIdentifier('effects'),
		b.jsxExpressionContainer(array as never),
	) as unknown as JSXAttribute;
};

const makeEffectsArray = (calls: CallExpression[]): ArrayExpression => {
	return b.arrayExpression(calls as never) as unknown as ArrayExpression;
};

const makeParamsObjectExpression = ({
	params,
	remotionLocalNames,
}: {
	params: EffectClipboardSnapshot['params'];
	remotionLocalNames: RemotionLocalNames;
}): ObjectExpression => {
	return b.objectExpression(
		Object.entries(params).map(([key, param]) => {
			const keyNode = identifierRegex.test(key)
				? b.identifier(key)
				: b.stringLiteral(key);
			return b.objectProperty(
				keyNode as never,
				makeParamExpression({param, remotionLocalNames}) as never,
			) as ObjectProperty;
		}) as never,
	) as ObjectExpression;
};

const makeEffectCall = ({
	ast,
	effect,
	remotionLocalNames,
}: {
	ast: ReturnType<typeof parseAst>;
	effect: EffectClipboardSnapshot;
	remotionLocalNames: RemotionLocalNames;
}): CallExpression => {
	assertValidEffect({
		effectName: effect.callee,
		effectImportPath: effect.importPath,
	});
	const localName = ensureEffectImport({
		ast,
		effectName: effect.callee,
		effectImportPath: effect.importPath,
	});

	return b.callExpression(b.identifier(localName), [
		makeParamsObjectExpression({
			params: effect.params,
			remotionLocalNames,
		}) as never,
	]) as unknown as CallExpression;
};

const removeEffectsAttr = (
	attributes: NonNullable<
		ReturnType<typeof findJsxElementAtNodePath>
	>['attributes'],
	attr: JSXAttribute,
) => {
	const index = attributes.indexOf(attr);
	if (index !== -1) {
		attributes.splice(index, 1);
	}
};

export const pasteEffects = async ({
	input,
	targetSequenceNodePath,
	type,
	effects,
	insertAtIndices,
	prettierConfigOverride,
}: {
	readonly input: string;
	readonly targetFileName: string;
	readonly targetSequenceNodePath: SequenceNodePath;
	readonly type: EffectClipboardPasteType;
	readonly effects: EffectClipboardSnapshot[];
	readonly insertAtIndices: number[] | null;
	readonly prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{
	readonly output: string;
	readonly formatted: boolean;
	readonly effectLabels: string[];
	readonly logLine: number;
}> => {
	const ast = parseAst(input);
	const targetJsxPath = getAstNodePath(ast, targetSequenceNodePath);
	const targetJsx = findJsxElementAtNodePath(ast, targetSequenceNodePath);
	if (!targetJsx || !targetJsxPath) {
		throw new Error(
			'Could not find a JSX element at the specified location to paste effects',
		);
	}

	const requiredRemotionImports = getRequiredRemotionImports(effects);
	const remotionLocalNames = ensureRemotionImportLocalNames({
		ast,
		requiredImports: requiredRemotionImports,
	});
	if (requiredRemotionImports.has('useCurrentFrame')) {
		const fnPath = findEnclosingFunctionPath(targetJsxPath);
		if (fnPath) {
			ensureUseCurrentFrameHook(
				fnPath,
				remotionLocalNames.useCurrentFrame ?? 'useCurrentFrame',
			);
		}
	}

	const effectCalls = effects.map((effect) =>
		makeEffectCall({ast, effect, remotionLocalNames}),
	);
	const effectLabels = effects.map((effect) => `${effect.callee}()`);

	const existingAttr = findEffectsAttr(targetJsx.attributes ?? []);

	if (insertAtIndices !== null) {
		if (
			type !== 'effects-additive' ||
			insertAtIndices.length !== effectCalls.length ||
			new Set(insertAtIndices).size !== insertAtIndices.length ||
			insertAtIndices.some((index) => !Number.isInteger(index) || index < 0)
		) {
			throw new Error('Cannot paste effects: invalid insertion indices');
		}
	}

	if (type === 'effects-replacing') {
		if (existingAttr) {
			removeEffectsAttr(targetJsx.attributes, existingAttr);
		}

		if (effectCalls.length > 0) {
			targetJsx.attributes.push(makeEffectsAttr(makeEffectsArray(effectCalls)));
		}
	} else if (effectCalls.length === 0) {
		throw new Error('Cannot paste effects: no effects were copied');
	} else if (insertAtIndices === null) {
		if (existingAttr) {
			getEffectsArray(existingAttr).elements.push(
				...(effectCalls as ArrayExpression['elements']),
			);
		} else {
			targetJsx.attributes.push(makeEffectsAttr(makeEffectsArray(effectCalls)));
		}
	} else {
		const elements = existingAttr
			? getEffectsArray(existingAttr).elements
			: ([] as ArrayExpression['elements']);
		const indexedCalls = effectCalls
			.map((effect, index) => ({
				effect,
				index: insertAtIndices[index] as number,
			}))
			.sort((left, right) => left.index - right.index);
		for (const indexedCall of indexedCalls) {
			elements.splice(
				Math.min(indexedCall.index, elements.length),
				0,
				indexedCall.effect,
			);
		}

		if (!existingAttr) {
			targetJsx.attributes.push(
				makeEffectsAttr(
					b.arrayExpression(elements as never) as ArrayExpression,
				),
			);
		}
	}

	const finalFile = serializeAst(ast);
	const {output, formatted} = await formatFileContent({
		input: finalFile,
		prettierConfigOverride,
	});

	return {
		output,
		formatted,
		effectLabels,
		logLine: targetJsx.loc?.start.line ?? 1,
	};
};
