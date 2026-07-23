import type {ArrayExpression, Expression, JSXAttribute} from '@babel/types';
import {cloneNode} from '@babel/types';
import type {SequenceNodePath} from 'remotion';
import {findJsxElementAtNodePath} from '../preview-server/routes/can-update-sequence-props';
import {formatFileContent} from './format-file-content';
import {parseAst, serializeAst} from './parse-ast';
import {
	findEffectCallExpression,
	findEffectsAttr,
} from './update-effect-props/update-effect-props';

const getEffectsArray = (attr: JSXAttribute): ArrayExpression => {
	if (!attr.value || attr.value.type !== 'JSXExpressionContainer') {
		throw new Error('Cannot duplicate effect: effects prop is not an array');
	}

	const expr = attr.value.expression as Expression;
	if (expr.type !== 'ArrayExpression') {
		throw new Error('Cannot duplicate effect: effects prop is not an array');
	}

	return expr;
};

export type EffectDuplicationTarget = {
	sequenceNodePath: SequenceNodePath;
	effectIndex: number;
};

type EffectsArrayDuplication = {
	effectsArray: ArrayExpression;
	effectIndices: Set<number>;
	effectLabels: string[];
	logLines: number[];
};

export const duplicateEffects = async ({
	input,
	effects,
	prettierConfigOverride,
}: {
	input: string;
	effects: EffectDuplicationTarget[];
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{
	output: string;
	formatted: boolean;
	effectLabels: string[];
	logLines: number[];
}> => {
	if (effects.length === 0) {
		throw new Error('No effects were specified for duplication');
	}

	const ast = parseAst(input);
	const duplicationsByAttr = new Map<JSXAttribute, EffectsArrayDuplication>();

	for (const effect of effects) {
		const {sequenceNodePath, effectIndex} = effect;
		const jsx = findJsxElementAtNodePath(ast, sequenceNodePath);
		if (!jsx) {
			throw new Error(
				'Could not find a JSX element at the specified location to duplicate effect',
			);
		}

		const attr = findEffectsAttr(jsx.attributes ?? []);
		if (!attr) {
			throw new Error('Could not find effects on the target JSX element');
		}

		const effectsArray = getEffectsArray(attr);
		const existingDuplication = duplicationsByAttr.get(attr);
		const duplication =
			existingDuplication ??
			({
				effectsArray,
				effectIndices: new Set<number>(),
				effectLabels: [],
				logLines: [],
			} satisfies EffectsArrayDuplication);

		duplicationsByAttr.set(attr, duplication);

		if (duplication.effectIndices.has(effectIndex)) {
			continue;
		}

		const found = findEffectCallExpression({attr, effectIndex});
		if (found.kind === 'error') {
			throw new Error(`Cannot duplicate effect: ${found.reason}`);
		}

		duplication.effectIndices.add(effectIndex);
		duplication.effectLabels.push(`${found.callee}()`);
		duplication.logLines.push(
			found.call.loc?.start.line ?? jsx.loc?.start.line ?? 1,
		);
	}

	for (const duplication of duplicationsByAttr.values()) {
		for (const effectIndex of [...duplication.effectIndices].sort(
			(a, b) => b - a,
		)) {
			const effect = duplication.effectsArray.elements[effectIndex];
			if (!effect || effect.type !== 'CallExpression') {
				throw new Error('Cannot duplicate effect: not-call-expression');
			}

			duplication.effectsArray.elements.splice(
				effectIndex + 1,
				0,
				cloneNode(effect, true) as never,
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
		effectLabels: [...duplicationsByAttr.values()].flatMap(
			(duplication) => duplication.effectLabels,
		),
		logLines: [...duplicationsByAttr.values()].flatMap(
			(duplication) => duplication.logLines,
		),
	};
};

export const duplicateEffect = async ({
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
	const {output, formatted, effectLabels, logLines} = await duplicateEffects({
		input,
		effects: [{sequenceNodePath, effectIndex}],
		prettierConfigOverride,
	});

	return {
		output,
		formatted,
		effectLabel: effectLabels[0],
		logLine: logLines[0],
	};
};
