import {readFileSync} from 'node:fs';
import path from 'node:path';
import type {
	CallExpression,
	Expression,
	JSXAttribute,
	JSXOpeningElement,
	ObjectExpression,
	ObjectProperty,
} from '@babel/types';
import type {
	CanUpdateEffectPropsResponse,
	CanUpdateSequencePropStatus,
	SequenceNodePath,
	SequenceSchema,
} from 'remotion';
import {parseAst} from '../../codemods/parse-ast';
import {
	enumerateEffectArrayElements,
	type EffectArrayElement,
} from '../../codemods/update-effect-props/update-effect-props';
import {
	extractStaticValue,
	findJsxElementAtNodePath,
	isStaticValue,
} from './can-update-sequence-props';

const findExperimentalEffectsAttr = (
	jsx: JSXOpeningElement,
): JSXAttribute | null => {
	for (const attr of jsx.attributes) {
		if (attr.type !== 'JSXAttribute') {
			continue;
		}

		if (
			attr.name.type === 'JSXIdentifier' &&
			attr.name.name === '_experimentalEffects'
		) {
			return attr;
		}
	}

	return null;
};

const getEffectsArrayElements = (
	attr: JSXAttribute | null,
): EffectArrayElement[] | null => {
	if (!attr || !attr.value || attr.value.type !== 'JSXExpressionContainer') {
		return null;
	}

	const expr = attr.value.expression as Expression;
	if (expr.type !== 'ArrayExpression') {
		return null;
	}

	return enumerateEffectArrayElements(expr);
};

const getPropsFromObjectExpression = ({
	objExpr,
	keys,
}: {
	objExpr: ObjectExpression;
	keys: string[];
}): Record<string, CanUpdateSequencePropStatus> => {
	const out: Record<string, CanUpdateSequencePropStatus> = {};

	for (const key of keys) {
		const prop = objExpr.properties.find(
			(p) =>
				p.type === 'ObjectProperty' &&
				((p.key.type === 'Identifier' && p.key.name === key) ||
					(p.key.type === 'StringLiteral' &&
						(p.key as {value: string}).value === key)),
		) as ObjectProperty | undefined;

		if (!prop) {
			out[key] = {canUpdate: true, codeValue: undefined};
			continue;
		}

		const valueExpr = prop.value as Expression;
		if (!isStaticValue(valueExpr)) {
			out[key] = {canUpdate: false, reason: 'computed'};
			continue;
		}

		out[key] = {
			canUpdate: true,
			codeValue: extractStaticValue(valueExpr),
		};
	}

	return out;
};

export const computeEffectPropStatus = ({
	jsx,
	effectIndex,
	keys,
}: {
	jsx: JSXOpeningElement;
	effectIndex: number;
	keys: string[];
}): CanUpdateEffectPropsResponse => {
	const attr = findExperimentalEffectsAttr(jsx);
	const elements = getEffectsArrayElements(attr);

	if (!elements) {
		return {
			canUpdate: false,
			effectIndex,
			reason: 'not-found',
		};
	}

	if (effectIndex < 0 || effectIndex >= elements.length) {
		return {
			canUpdate: false,
			effectIndex,
			reason: 'not-found',
		};
	}

	const target = elements[effectIndex];
	if (target.kind !== 'call') {
		return {
			canUpdate: false,
			effectIndex,
			reason: 'not-call-expression',
		};
	}

	const call: CallExpression = target.node;
	if (call.arguments.length === 0) {
		const emptyProps: Record<string, CanUpdateSequencePropStatus> = {};
		for (const key of keys) {
			emptyProps[key] = {canUpdate: true, codeValue: undefined};
		}

		return {
			canUpdate: true,
			callee: target.callee,
			effectIndex,
			props: emptyProps,
		};
	}

	const firstArg = call.arguments[0];
	if (firstArg.type !== 'ObjectExpression') {
		return {
			canUpdate: false,
			effectIndex,
			reason: 'computed',
		};
	}

	const resolvedProps = getPropsFromObjectExpression({
		objExpr: firstArg as ObjectExpression,
		keys,
	});

	return {
		canUpdate: true,
		effectIndex,
		callee: target.callee,
		props: resolvedProps,
	};
};

export const computeEffectPropsStatusesFromContent = ({
	fileContents,
	sequenceNodePath,
	effects,
	keysFor,
}: {
	fileContents: string;
	sequenceNodePath: SequenceNodePath;
	effects: SequenceSchema[];
	keysFor: (effect: SequenceSchema) => string[];
}): CanUpdateEffectPropsResponse[] => {
	const ast = parseAst(fileContents);
	const jsx = findJsxElementAtNodePath(ast, sequenceNodePath);
	if (!jsx) {
		return effects.map((_effect, effectIndex) => ({
			canUpdate: false as const,
			effectIndex,
			reason: 'not-found' as const,
		}));
	}

	return effects.map((effect, effectIndex) =>
		computeEffectPropStatus({
			jsx,
			effectIndex,
			keys: keysFor(effect),
		}),
	);
};

export const computeEffectPropsStatusesFromFile = ({
	fileName,
	sequenceNodePath,
	effects,
	keysFor,
	remotionRoot,
}: {
	fileName: string;
	sequenceNodePath: SequenceNodePath;
	effects: SequenceSchema[];
	keysFor: (effect: SequenceSchema) => string[];
	remotionRoot: string;
}): CanUpdateEffectPropsResponse[] => {
	const absolutePath = path.resolve(remotionRoot, fileName);
	const fileRelativeToRoot = path.relative(remotionRoot, absolutePath);
	if (fileRelativeToRoot.startsWith('..')) {
		throw new Error('Cannot read a file outside the project');
	}

	const fileContents = readFileSync(absolutePath, 'utf-8');
	return computeEffectPropsStatusesFromContent({
		fileContents,
		sequenceNodePath,
		effects,
		keysFor,
	});
};
