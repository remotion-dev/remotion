import type {
	ArrayExpression,
	Expression,
	JSXAttribute,
	JSXSpreadAttribute,
} from '@babel/types';
import type {SequenceNodePath} from 'remotion';
import {findJsxElementAtNodePath} from '../preview-server/routes/can-update-sequence-props';
import {formatFileContent} from './format-file-content';
import {parseAst, serializeAst} from './parse-ast';
import {
	enumerateEffectArrayElements,
	findEffectCallExpression,
	findEffectsAttr,
} from './update-effect-props/update-effect-props';

const getEffectsArray = (attr: JSXAttribute): ArrayExpression => {
	if (!attr.value || attr.value.type !== 'JSXExpressionContainer') {
		throw new Error('Cannot delete effect: effects prop is not an array');
	}

	const expr = attr.value.expression as Expression;
	if (expr.type !== 'ArrayExpression') {
		throw new Error('Cannot delete effect: effects prop is not an array');
	}

	return expr;
};

export type EffectDeletionTarget = {
	sequenceNodePath: SequenceNodePath;
} & (
	| {
			type: 'single-effect';
			effectIndex: number;
	  }
	| {
			type: 'all-effects';
	  }
);

type EffectsArrayDeletion = {
	jsxAttributes: Array<JSXAttribute | JSXSpreadAttribute>;
	attr: JSXAttribute;
	effectsArray: ArrayExpression;
	allEffects: boolean;
	effectIndices: Set<number>;
	effectLabels: string[];
	logLines: number[];
};

const getAllEffectLabels = (
	effectsArray: ArrayExpression,
	attr: JSXAttribute,
): {effectLabels: string[]; logLines: number[]} => {
	if (effectsArray.elements.length === 0) {
		throw new Error('Cannot delete effect: no effects found');
	}

	const elements = enumerateEffectArrayElements(effectsArray);
	return {
		effectLabels: elements.map((effect) =>
			effect.kind === 'call' ? `${effect.callee}()` : 'effect',
		),
		logLines: elements.map((effect) =>
			effect.kind === 'call'
				? (effect.node.loc?.start.line ?? attr.loc?.start.line ?? 1)
				: (attr.loc?.start.line ?? 1),
		),
	};
};

export const deleteEffects = async ({
	input,
	effects,
	prettierConfigOverride,
}: {
	input: string;
	effects: EffectDeletionTarget[];
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{
	output: string;
	formatted: boolean;
	effectLabels: string[];
	logLines: number[];
}> => {
	if (effects.length === 0) {
		throw new Error('No effects were specified for deletion');
	}

	const ast = parseAst(input);
	const deletionsByAttr = new Map<JSXAttribute, EffectsArrayDeletion>();

	for (const effect of effects) {
		const {sequenceNodePath} = effect;
		const jsx = findJsxElementAtNodePath(ast, sequenceNodePath);
		if (!jsx) {
			throw new Error(
				'Could not find a JSX element at the specified location to delete effect',
			);
		}

		const attr = findEffectsAttr(jsx.attributes ?? []);
		if (!attr) {
			throw new Error('Could not find effects on the target JSX element');
		}

		const effectsArray = getEffectsArray(attr);
		const existingDeletion = deletionsByAttr.get(attr);
		const deletion =
			existingDeletion ??
			({
				jsxAttributes: jsx.attributes,
				attr,
				effectsArray,
				allEffects: false,
				effectIndices: new Set<number>(),
				effectLabels: [],
				logLines: [],
			} satisfies EffectsArrayDeletion);

		deletionsByAttr.set(attr, deletion);

		if (effect.type === 'all-effects') {
			const {effectLabels, logLines} = getAllEffectLabels(effectsArray, attr);
			deletion.allEffects = true;
			deletion.effectIndices.clear();
			deletion.effectLabels = effectLabels;
			deletion.logLines = logLines;
			continue;
		}

		const {effectIndex} = effect;
		if (deletion.allEffects || deletion.effectIndices.has(effectIndex)) {
			continue;
		}

		const found = findEffectCallExpression({attr, effectIndex});
		if (found.kind === 'error') {
			throw new Error(`Cannot delete effect: ${found.reason}`);
		}

		deletion.effectIndices.add(effectIndex);
		deletion.effectLabels.push(`${found.callee}()`);
		deletion.logLines.push(
			found.call.loc?.start.line ?? jsx.loc?.start.line ?? 1,
		);
	}

	for (const deletion of deletionsByAttr.values()) {
		if (deletion.allEffects) {
			const attrIndex = deletion.jsxAttributes.indexOf(deletion.attr);
			if (attrIndex !== -1) {
				deletion.jsxAttributes.splice(attrIndex, 1);
			}

			continue;
		}

		for (const effectIndex of [...deletion.effectIndices].sort(
			(a, b) => b - a,
		)) {
			deletion.effectsArray.elements.splice(effectIndex, 1);
		}

		if (deletion.effectsArray.elements.length === 0) {
			const attrIndex = deletion.jsxAttributes.indexOf(deletion.attr);
			if (attrIndex !== -1) {
				deletion.jsxAttributes.splice(attrIndex, 1);
			}
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
		effectLabels: [...deletionsByAttr.values()].flatMap(
			(deletion) => deletion.effectLabels,
		),
		logLines: [...deletionsByAttr.values()].flatMap(
			(deletion) => deletion.logLines,
		),
	};
};

export const deleteEffect = async ({
	input,
	sequenceNodePath,
	effectIndex,
	prettierConfigOverride,
}: {
	input: string;
	sequenceNodePath: SequenceNodePath;
	effectIndex: number;
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{
	output: string;
	formatted: boolean;
	effectLabel: string;
	logLine: number;
}> => {
	const {output, formatted, effectLabels, logLines} = await deleteEffects({
		input,
		effects: [{type: 'single-effect', sequenceNodePath, effectIndex}],
		prettierConfigOverride,
	});

	return {
		output,
		formatted,
		effectLabel: effectLabels[0],
		logLine: logLines[0],
	};
};
