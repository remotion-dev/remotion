import type {
	ArrayExpression,
	CallExpression,
	Expression,
	JSXAttribute,
} from '@babel/types';
import type {
	EffectClipboardPasteType,
	EffectClipboardSource,
} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {findJsxElementAtNodePath} from '../preview-server/routes/can-update-sequence-props';
import {formatFileContent} from './format-file-content';
import {parseAst, serializeAst} from './parse-ast';
import {
	enumerateEffectArrayElements,
	findEffectCallExpression,
	findEffectsAttr,
} from './update-effect-props/update-effect-props';

const b = recast.types.builders;

const getEffectsArray = (
	attr: JSXAttribute,
	action: 'read' | 'append',
): ArrayExpression => {
	if (!attr.value || attr.value.type !== 'JSXExpressionContainer') {
		throw new Error(`Cannot ${action} effects: effects prop is not an array`);
	}

	const expr = attr.value.expression as Expression;
	if (expr.type !== 'ArrayExpression') {
		throw new Error(`Cannot ${action} effects: effects prop is not an array`);
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

const cloneCallExpression = (call: CallExpression): CallExpression => {
	const {code} = recast.print(call);
	const ast = parseAst(`const __remotionEffect = ${code};`);
	const stmt = ast.program.body[0];
	if (
		stmt.type !== 'VariableDeclaration' ||
		stmt.declarations[0]?.init?.type !== 'CallExpression'
	) {
		throw new Error('Cannot paste effects: failed to clone effect expression');
	}

	return stmt.declarations[0].init as CallExpression;
};

const getSourceEffects = ({
	source,
	targetFileName,
	ast,
}: {
	readonly source: EffectClipboardSource;
	readonly targetFileName: string;
	readonly ast: ReturnType<typeof parseAst>;
}): {calls: CallExpression[]; labels: string[]} => {
	if (source.fileName !== targetFileName) {
		throw new Error(
			'Cannot paste effects from a different source file yet. Paste between sequences in the same file to preserve keyframes and referenced values.',
		);
	}

	const jsx = findJsxElementAtNodePath(
		ast,
		source.sequenceNodePath.nodePath as SequenceNodePath,
	);
	if (!jsx) {
		throw new Error(
			'Could not find a JSX element at the specified location to copy effects',
		);
	}

	const attr = findEffectsAttr(jsx.attributes ?? []);
	if (!attr) {
		if (source.type === 'all-effects') {
			return {calls: [], labels: []};
		}

		throw new Error('Could not find effects on the source JSX element');
	}

	if (source.type === 'single-effect') {
		const found = findEffectCallExpression({
			attr,
			effectIndex: source.effectIndex,
		});
		if (found.kind === 'error') {
			throw new Error(
				`Cannot paste source effect at index ${source.effectIndex}: ${found.reason}`,
			);
		}

		return {
			calls: [cloneCallExpression(found.call)],
			labels: [`${found.callee}()`],
		};
	}

	const effectsArray = getEffectsArray(attr, 'read');
	const elements = enumerateEffectArrayElements(effectsArray);
	const calls: CallExpression[] = [];
	const labels: string[] = [];

	for (const [index, effect] of elements.entries()) {
		if (effect.kind !== 'call') {
			throw new Error(
				`Cannot paste source effect at index ${index}: ${effect.reason}`,
			);
		}

		calls.push(cloneCallExpression(effect.node));
		labels.push(`${effect.callee}()`);
	}

	return {calls, labels};
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
	targetFileName,
	targetSequenceNodePath,
	type,
	sources,
	prettierConfigOverride,
}: {
	readonly input: string;
	readonly targetFileName: string;
	readonly targetSequenceNodePath: SequenceNodePath;
	readonly type: EffectClipboardPasteType;
	readonly sources: EffectClipboardSource[];
	readonly prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{
	readonly output: string;
	readonly formatted: boolean;
	readonly effectLabels: string[];
	readonly logLine: number;
}> => {
	const ast = parseAst(input);
	const copied = sources.map((source) =>
		getSourceEffects({source, targetFileName, ast}),
	);
	const effectCalls = copied.flatMap((item) => item.calls);
	const effectLabels = copied.flatMap((item) => item.labels);

	const targetJsx = findJsxElementAtNodePath(ast, targetSequenceNodePath);
	if (!targetJsx) {
		throw new Error(
			'Could not find a JSX element at the specified location to paste effects',
		);
	}

	const existingAttr = findEffectsAttr(targetJsx.attributes ?? []);

	if (type === 'effects-replacing') {
		if (existingAttr) {
			removeEffectsAttr(targetJsx.attributes, existingAttr);
		}

		if (effectCalls.length > 0) {
			targetJsx.attributes.push(makeEffectsAttr(makeEffectsArray(effectCalls)));
		}
	} else if (existingAttr) {
		getEffectsArray(existingAttr, 'append').elements.push(
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
