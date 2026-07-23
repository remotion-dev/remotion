import type {ArrayExpression, Expression, JSXAttribute} from '@babel/types';
import type {SequenceNodePath} from 'remotion';
import {findJsxElementAtNodePath} from '../preview-server/routes/can-update-sequence-props';
import {formatFileContent} from './format-file-content';
import {parseAst, serializeAst} from './parse-ast';
import {
	enumerateEffectArrayElements,
	findEffectsAttr,
} from './update-effect-props/update-effect-props';

const getEffectsArray = (attr: JSXAttribute): ArrayExpression => {
	if (!attr.value || attr.value.type !== 'JSXExpressionContainer') {
		throw new Error('Cannot reorder effect: effects prop is not an array');
	}

	const expr = attr.value.expression as Expression;
	if (expr.type !== 'ArrayExpression') {
		throw new Error('Cannot reorder effect: effects prop is not an array');
	}

	return expr;
};

export const reorderEffect = async ({
	input,
	sequenceNodePath,
	fromIndex,
	toIndex,
	prettierConfigOverride,
}: {
	input: string;
	sequenceNodePath: SequenceNodePath;
	fromIndex: number;
	toIndex: number;
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{
	output: string;
	formatted: boolean;
	effectLabel: string;
	logLine: number;
}> => {
	const ast = parseAst(input);
	const jsx = findJsxElementAtNodePath(ast, sequenceNodePath);
	if (!jsx) {
		throw new Error(
			'Could not find a JSX element at the specified location to reorder effect',
		);
	}

	const attr = findEffectsAttr(jsx.attributes ?? []);
	if (!attr) {
		throw new Error('Could not find effects on the target JSX element');
	}

	const effectsArray = getEffectsArray(attr);
	const elements = enumerateEffectArrayElements(effectsArray);
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

	if (fromIndex !== toIndex) {
		const [moved] = effectsArray.elements.splice(fromIndex, 1);
		if (!moved) {
			throw new Error(
				'Cannot reorder effect: source effect is not-call-expression',
			);
		}

		effectsArray.elements.splice(toIndex, 0, moved);
	}

	const finalFile = serializeAst(ast);
	const {output, formatted} = await formatFileContent({
		input: finalFile,
		prettierConfigOverride,
	});

	return {
		output,
		formatted,
		effectLabel: `${target.callee}()`,
		logLine: target.node.loc?.start.line ?? jsx.loc?.start.line ?? 1,
	};
};
