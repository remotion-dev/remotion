import type {ArrayExpression, CallExpression, JSXAttribute} from '@babel/types';
import type {
	EffectClipboardPasteType,
	EffectClipboardSnapshot,
} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {findJsxElementAtNodePath} from '../preview-server/routes/can-update-sequence-props';
import {
	assertValidEffect,
	ensureEffectImport,
	makeConfigObjectExpression,
} from './add-effect';
import {formatFileContent} from './format-file-content';
import {parseAst, serializeAst} from './parse-ast';
import {findEffectsAttr} from './update-effect-props/update-effect-props';

const b = recast.types.builders;

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

const makeEffectCall = ({
	ast,
	effect,
}: {
	ast: ReturnType<typeof parseAst>;
	effect: EffectClipboardSnapshot;
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
		makeConfigObjectExpression(effect.params) as never,
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
	prettierConfigOverride,
}: {
	readonly input: string;
	readonly targetFileName: string;
	readonly targetSequenceNodePath: SequenceNodePath;
	readonly type: EffectClipboardPasteType;
	readonly effects: EffectClipboardSnapshot[];
	readonly prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{
	readonly output: string;
	readonly formatted: boolean;
	readonly effectLabels: string[];
	readonly logLine: number;
}> => {
	const ast = parseAst(input);
	const targetJsx = findJsxElementAtNodePath(ast, targetSequenceNodePath);
	if (!targetJsx) {
		throw new Error(
			'Could not find a JSX element at the specified location to paste effects',
		);
	}

	const effectCalls = effects.map((effect) => makeEffectCall({ast, effect}));
	const effectLabels = effects.map((effect) => `${effect.callee}()`);

	const existingAttr = findEffectsAttr(targetJsx.attributes ?? []);

	if (type === 'effects-replacing') {
		if (existingAttr) {
			removeEffectsAttr(targetJsx.attributes, existingAttr);
		}

		if (effectCalls.length > 0) {
			targetJsx.attributes.push(makeEffectsAttr(makeEffectsArray(effectCalls)));
		}
	} else if (existingAttr) {
		getEffectsArray(existingAttr).elements.push(
			...(effectCalls as ArrayExpression['elements']),
		);
	} else if (effectCalls.length > 0) {
		targetJsx.attributes.push(makeEffectsAttr(makeEffectsArray(effectCalls)));
	} else {
		throw new Error('Cannot paste effects: no effects were copied');
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
