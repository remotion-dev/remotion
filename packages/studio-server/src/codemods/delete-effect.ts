import type {ArrayExpression, Expression, JSXAttribute} from '@babel/types';
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
		throw new Error('Cannot delete effect: effects prop is not an array');
	}

	const expr = attr.value.expression as Expression;
	if (expr.type !== 'ArrayExpression') {
		throw new Error('Cannot delete effect: effects prop is not an array');
	}

	return expr;
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
	const ast = parseAst(input);
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
	const found = findEffectCallExpression({attr, effectIndex});
	if (found.kind === 'error') {
		throw new Error(`Cannot delete effect: ${found.reason}`);
	}

	effectsArray.elements.splice(effectIndex, 1);

	if (effectsArray.elements.length === 0) {
		const attrIndex = jsx.attributes.indexOf(attr);
		if (attrIndex !== -1) {
			jsx.attributes.splice(attrIndex, 1);
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
		effectLabel: `${found.callee}()`,
		logLine: found.call.loc?.start.line ?? jsx.loc?.start.line ?? 1,
	};
};
