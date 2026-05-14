import type {
	ArrayExpression,
	CallExpression,
	Expression,
	JSXAttribute,
	ObjectExpression,
	ObjectProperty,
	StringLiteral,
} from '@babel/types';
import {stringifyDefaultProps} from '@remotion/studio-shared';
import type {ExpressionKind} from 'ast-types/lib/gen/kinds';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {findJsxElementAtNodePath} from '../../preview-server/routes/can-update-sequence-props';
import {formatFileContent} from '../format-file-content';
import {parseAst, serializeAst} from '../parse-ast';

const b = recast.types.builders;

export type EffectPropUpdate = {
	key: string;
	value: unknown;
	defaultValue: unknown | null;
};

export type UpdateEffectPropsResult = {
	output: string;
	formatted: boolean;
	oldValueString: string;
	logLine: number;
};

const parseValueExpression = (value: unknown): ExpressionKind => {
	const code = `a = ${stringifyDefaultProps({props: value, enumPaths: []})}`;
	const ast = parseAst(code);
	const stmt = ast.program.body[0];
	if (
		stmt.type !== 'ExpressionStatement' ||
		stmt.expression.type !== 'AssignmentExpression'
	) {
		throw new Error('Failed to parse effect prop value expression');
	}

	return stmt.expression.right as ExpressionKind;
};

const findExperimentalEffectsAttr = (
	attrs: readonly (JSXAttribute | unknown)[],
): JSXAttribute | null => {
	for (const attr of attrs) {
		if ((attr as JSXAttribute).type !== 'JSXAttribute') {
			continue;
		}

		const a = attr as JSXAttribute;
		if (
			a.name.type === 'JSXIdentifier' &&
			a.name.name === '_experimentalEffects'
		) {
			return a;
		}
	}

	return null;
};

const getCalleeName = (call: CallExpression): string | null => {
	const {callee} = call;
	if (callee.type === 'Identifier') {
		return callee.name;
	}

	if (
		callee.type === 'MemberExpression' &&
		!callee.computed &&
		callee.property.type === 'Identifier'
	) {
		return callee.property.name;
	}

	return null;
};

export type EffectArrayElement =
	| {kind: 'call'; callee: string; node: CallExpression}
	| {kind: 'unsupported'; reason: 'not-call-expression' | 'spread'};

export const enumerateEffectArrayElements = (
	arr: ArrayExpression,
): EffectArrayElement[] => {
	const out: EffectArrayElement[] = [];
	for (const el of arr.elements) {
		if (el === null) {
			out.push({kind: 'unsupported', reason: 'not-call-expression'});
			continue;
		}

		if (el.type === 'SpreadElement') {
			out.push({kind: 'unsupported', reason: 'spread'});
			continue;
		}

		if (el.type !== 'CallExpression') {
			out.push({kind: 'unsupported', reason: 'not-call-expression'});
			continue;
		}

		const call = el as CallExpression;
		const callee = getCalleeName(call);
		if (callee === null) {
			out.push({kind: 'unsupported', reason: 'not-call-expression'});
			continue;
		}

		out.push({kind: 'call', callee, node: call});
	}

	return out;
};

export const findEffectCallExpression = ({
	attr,
	effectIndex,
}: {
	attr: JSXAttribute;
	effectIndex: number;
}):
	| {kind: 'ok'; call: CallExpression}
	| {
			kind: 'error';
			reason: 'no-args-object' | 'not-found' | 'not-call-expression';
	  } => {
	if (!attr.value || attr.value.type !== 'JSXExpressionContainer') {
		return {kind: 'error', reason: 'not-call-expression'};
	}

	const expr = attr.value.expression as Expression;
	if (expr.type !== 'ArrayExpression') {
		return {kind: 'error', reason: 'not-call-expression'};
	}

	const elements = enumerateEffectArrayElements(expr);

	if (effectIndex < 0 || effectIndex >= elements.length) {
		return {kind: 'error', reason: 'not-found'};
	}

	const target = elements[effectIndex];
	if (target.kind !== 'call') {
		return {kind: 'error', reason: 'not-call-expression'};
	}

	return {kind: 'ok', call: target.node};
};

const findObjectProperty = (
	objExpr: ObjectExpression,
	propertyName: string,
): {propIndex: number; prop: ObjectProperty | undefined} => {
	const propIndex = objExpr.properties.findIndex(
		(p) =>
			p.type === 'ObjectProperty' &&
			((p.key.type === 'Identifier' && p.key.name === propertyName) ||
				(p.key.type === 'StringLiteral' &&
					(p.key as StringLiteral).value === propertyName)),
	);

	return {
		propIndex,
		prop:
			propIndex !== -1
				? (objExpr.properties[propIndex] as ObjectProperty)
				: undefined,
	};
};

export const updateEffectPropsAst = ({
	input,
	sequenceNodePath,
	effectIndex,
	update,
}: {
	input: string;
	sequenceNodePath: SequenceNodePath;
	effectIndex: number;
	update: EffectPropUpdate;
}): {
	serialized: string;
	oldValueString: string;
	logLine: number;
} => {
	const ast = parseAst(input);
	const jsx = findJsxElementAtNodePath(ast, sequenceNodePath);
	if (!jsx) {
		throw new Error(
			'Could not find a JSX element at the specified location to update effects',
		);
	}

	const attr = findExperimentalEffectsAttr(jsx.attributes ?? []);
	if (!attr) {
		throw new Error(
			'Could not find _experimentalEffects on the target JSX element',
		);
	}

	const found = findEffectCallExpression({
		attr,
		effectIndex,
	});

	if (found.kind === 'error') {
		throw new Error(`Cannot update effect prop: ${found.reason}`);
	}

	const {call} = found;

	if (
		call.arguments.length === 0 ||
		call.arguments[0].type !== 'ObjectExpression'
	) {
		throw new Error('Cannot update effect prop: no-args-object');
	}

	const objExpr = call.arguments[0] as ObjectExpression;
	const {prop} = findObjectProperty(objExpr, update.key);

	const isDefault =
		update.defaultValue !== null &&
		JSON.stringify(update.value) === JSON.stringify(update.defaultValue);

	let oldValueString = '';
	if (prop) {
		oldValueString = recast.print(prop.value).code;
	} else if (update.defaultValue !== null) {
		oldValueString = JSON.stringify(update.defaultValue);
	}

	if (isDefault) {
		if (prop) {
			const idx = objExpr.properties.indexOf(prop);
			if (idx !== -1) {
				objExpr.properties.splice(idx, 1);
			}
		}
	} else {
		const newValueExpr = parseValueExpression(update.value);
		if (prop) {
			prop.value = newValueExpr as ObjectProperty['value'];
		} else {
			objExpr.properties.push(
				b.objectProperty(
					b.identifier(update.key),
					newValueExpr,
				) as ObjectProperty,
			);
		}
	}

	const logLine = call.loc?.start.line ?? jsx.loc?.start.line ?? 1;

	return {
		serialized: serializeAst(ast),
		oldValueString,
		logLine,
	};
};

export const updateEffectProps = async ({
	input,
	sequenceNodePath,
	effectIndex,
	update,
	prettierConfigOverride,
}: {
	input: string;
	sequenceNodePath: SequenceNodePath;
	effectIndex: number;
	update: EffectPropUpdate;
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<UpdateEffectPropsResult> => {
	const {serialized, oldValueString, logLine} = updateEffectPropsAst({
		input,
		sequenceNodePath,
		effectIndex,
		update,
	});

	const {output, formatted} = await formatFileContent({
		input: serialized,
		prettierConfigOverride,
	});

	return {
		output,
		oldValueString,
		formatted,
		logLine,
	};
};
