import type {
	ArrayExpression,
	CallExpression,
	Expression,
	File,
	JSXAttribute,
	ObjectExpression,
	ObjectProperty,
	StringLiteral,
} from '@babel/types';
import type {EffectClipboardParam} from '@remotion/studio-shared';
import type {ExpressionKind} from 'ast-types/lib/gen/kinds';
import * as recast from 'recast';
import type {SequenceNodePath, InteractivitySchema} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {getAstNodePath} from '../../helpers/get-ast-node-path';
import {findJsxElementAtNodePath} from '../../preview-server/routes/can-update-sequence-props';
import {
	ensureRemotionImportLocalNames,
	getRequiredRemotionImportsForEffectParams,
	makeParamExpression,
} from '../effect-param-expression';
import {formatFileContent} from '../format-file-content';
import {parseAst, serializeAst} from '../parse-ast';
import {
	ensureUseCurrentFrameHook,
	findEnclosingFunctionPath,
} from '../update-keyframes/ensure-imports-and-frame-hook';
import {parseValueExpression} from '../update-nested-prop';

const b = recast.types.builders;

export type EffectPropUpdate =
	| {
			key: string;
			value: unknown;
			defaultValue: unknown | null;
	  }
	| {
			key: string;
			effectParam: EffectClipboardParam;
			defaultValue: unknown | null;
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

export type PropDelta = {
	key: string;
	valueString: string;
};

export const findEffectsAttr = (
	attrs: readonly (JSXAttribute | unknown)[],
): JSXAttribute | null => {
	for (const attr of attrs) {
		if ((attr as JSXAttribute).type !== 'JSXAttribute') {
			continue;
		}

		const a = attr as JSXAttribute;
		if (a.name.type === 'JSXIdentifier' && a.name.name === 'effects') {
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
	| {kind: 'ok'; call: CallExpression; callee: string}
	| {
			kind: 'error';
			reason: 'not-found' | 'not-call-expression';
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

	return {kind: 'ok', call: target.node, callee: target.callee};
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

const printObjectPropertyValue = (prop: ObjectProperty) =>
	recast
		.print(prop.value)
		.code.replace(/[\n\r\t]+/g, ' ')
		.replace(/,(\s*[}\]])/g, '$1')
		.trim();

const updateHasEffectParam = (
	update: EffectPropUpdate,
): update is Extract<EffectPropUpdate, {effectParam: EffectClipboardParam}> =>
	'effectParam' in update;

const getStaticUpdateValue = (update: EffectPropUpdate): unknown | null => {
	if (updateHasEffectParam(update)) {
		return update.effectParam.type === 'static'
			? update.effectParam.value
			: null;
	}

	return update.value;
};

const ensureClipboardParamImports = ({
	ast,
	sequenceNodePath,
	param,
}: {
	ast: File;
	sequenceNodePath: SequenceNodePath;
	param: EffectClipboardParam;
}) => {
	const requiredImports = getRequiredRemotionImportsForEffectParams([param]);
	const remotionLocalNames = ensureRemotionImportLocalNames({
		ast,
		requiredImports,
	});

	if (requiredImports.has('useCurrentFrame')) {
		const targetJsxPath = getAstNodePath(ast, sequenceNodePath);
		if (targetJsxPath) {
			const fnPath = findEnclosingFunctionPath(targetJsxPath);
			if (fnPath) {
				ensureUseCurrentFrameHook(
					fnPath,
					remotionLocalNames.useCurrentFrame ?? 'useCurrentFrame',
				);
			}
		}
	}

	return remotionLocalNames;
};

const makeUpdateValueExpression = ({
	ast,
	sequenceNodePath,
	update,
}: {
	ast: File;
	sequenceNodePath: SequenceNodePath;
	update: EffectPropUpdate;
}): ExpressionKind => {
	if (!updateHasEffectParam(update)) {
		return parseValueExpression(update.value);
	}

	const remotionLocalNames = ensureClipboardParamImports({
		ast,
		sequenceNodePath,
		param: update.effectParam,
	});

	return makeParamExpression({
		param: update.effectParam,
		remotionLocalNames,
	});
};

const removeObjectProperty = ({
	objExpr,
	propertyName,
}: {
	objExpr: ObjectExpression;
	propertyName: string;
}): PropDelta | null => {
	const {propIndex, prop} = findObjectProperty(objExpr, propertyName);
	if (!prop || propIndex === -1) {
		return null;
	}

	const valueString = printObjectPropertyValue(prop);
	objExpr.properties.splice(propIndex, 1);

	return {
		key: propertyName,
		valueString,
	};
};

export const updateEffectPropsAst = ({
	input,
	sequenceNodePath,
	effectIndex,
	update,
	schema,
}: {
	input: string;
	sequenceNodePath: SequenceNodePath;
	effectIndex: number;
	update: EffectPropUpdate;
	schema: InteractivitySchema;
}): {
	serialized: string;
	oldValueString: string;
	newValueString: string;
	logLine: number;
	effectCallee: string;
	removedProps: PropDelta[];
} => {
	const ast = parseAst(input);
	const jsx = findJsxElementAtNodePath(ast, sequenceNodePath);
	if (!jsx) {
		throw new Error(
			'Could not find a JSX element at the specified location to update effects',
		);
	}

	const attr = findEffectsAttr(jsx.attributes ?? []);
	if (!attr) {
		throw new Error('Could not find effects on the target JSX element');
	}

	const found = findEffectCallExpression({
		attr,
		effectIndex,
	});

	if (found.kind === 'error') {
		throw new Error(`Cannot update effect prop: ${found.reason}`);
	}

	const {call, callee: effectCallee} = found;

	const isDefault =
		!updateHasEffectParam(update) &&
		update.defaultValue !== null &&
		JSON.stringify(update.value) === JSON.stringify(update.defaultValue);

	let objExpr: ObjectExpression;

	if (call.arguments.length === 0) {
		if (isDefault) {
			return {
				serialized: serializeAst(ast),
				oldValueString: '',
				newValueString: JSON.stringify(update.defaultValue),
				logLine: call.loc?.start.line ?? jsx.loc?.start.line ?? 1,
				effectCallee,
				removedProps: [],
			};
		}

		objExpr = b.objectExpression([]) as ObjectExpression;
		call.arguments.push(objExpr);
	} else if (call.arguments[0].type !== 'ObjectExpression') {
		throw new Error('Cannot update effect prop: computed');
	} else {
		objExpr = call.arguments[0] as ObjectExpression;
	}

	const {prop} = findObjectProperty(objExpr, update.key);
	const removedProps: PropDelta[] = [];

	let oldValueString = '';
	if (prop) {
		oldValueString = recast.print(prop.value).code;
	} else if (update.defaultValue !== null) {
		oldValueString = JSON.stringify(update.defaultValue);
	}

	let newValueString = '';
	if (isDefault) {
		newValueString = JSON.stringify(update.defaultValue);
		if (prop) {
			const idx = objExpr.properties.indexOf(prop);
			if (idx !== -1) {
				objExpr.properties.splice(idx, 1);
			}
		}
	} else {
		const newValueExpr = makeUpdateValueExpression({
			ast,
			sequenceNodePath,
			update,
		});
		newValueString = recast.print(newValueExpr).code;
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

	const fieldSchema = schema[update.key];
	const staticUpdateValue = getStaticUpdateValue(update);
	if (
		fieldSchema &&
		fieldSchema.type === 'enum' &&
		staticUpdateValue !== null
	) {
		const propsToDelete = NoReactInternals.findPropsToDelete({
			schema,
			key: update.key,
			value: staticUpdateValue,
		});
		for (const propToDelete of propsToDelete) {
			const removed = removeObjectProperty({
				objExpr,
				propertyName: propToDelete,
			});
			if (removed) {
				removedProps.push(removed);
			}
		}
	}

	const logLine = call.loc?.start.line ?? jsx.loc?.start.line ?? 1;

	return {
		serialized: serializeAst(ast),
		oldValueString,
		newValueString,
		logLine,
		effectCallee,
		removedProps,
	};
};

export const updateEffectProps = async ({
	input,
	sequenceNodePath,
	effectIndex,
	update,
	schema,
	prettierConfigOverride,
}: {
	input: string;
	sequenceNodePath: SequenceNodePath;
	effectIndex: number;
	update: EffectPropUpdate;
	schema: InteractivitySchema;
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<UpdateEffectPropsResult> => {
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
	});

	const {output, formatted} = await formatFileContent({
		input: serialized,
		prettierConfigOverride,
	});

	return {
		output,
		oldValueString,
		newValueString,
		formatted,
		logLine,
		effectCallee,
		removedProps,
	};
};
