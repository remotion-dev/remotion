import type {
	ArrayExpression,
	CallExpression,
	File,
	JSXAttribute,
	ObjectExpression,
	ObjectProperty,
} from '@babel/types';
import type {
	EffectClipboardKeyframedParam,
	EffectClipboardParam,
	EffectClipboardPasteType,
	EffectClipboardSnapshot,
} from '@remotion/studio-shared';
import type {ExpressionKind} from 'ast-types/lib/gen/kinds';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {getAstNodePath} from '../helpers/get-ast-node-path';
import {ensureNamedImport} from '../helpers/imports';
import {findJsxElementAtNodePath} from '../preview-server/routes/can-update-sequence-props';
import {assertValidEffect, ensureEffectImport} from './add-effect';
import {formatFileContent} from './format-file-content';
import {parseAst, serializeAst} from './parse-ast';
import {findEffectsAttr} from './update-effect-props/update-effect-props';
import {
	ensureUseCurrentFrameHook,
	findEnclosingFunctionPath,
} from './update-keyframes/ensure-imports-and-frame-hook';
import {parseValueExpression} from './update-nested-prop';

const b = recast.types.builders;
const identifierRegex = /^[A-Za-z_$][0-9A-Za-z_$]*$/;

type RemotionImportName =
	| 'Easing'
	| 'interpolate'
	| 'interpolateColors'
	| 'useCurrentFrame';

type RemotionLocalNames = Partial<Record<RemotionImportName, string>>;

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

const isNonLinearEasing = (
	easing: EffectClipboardKeyframedParam['easing'][number],
) => easing !== 'linear';

const keyframedParamNeedsEasingImport = (
	param: EffectClipboardKeyframedParam,
) => {
	return (
		param.interpolationFunction !== 'interpolateColors' &&
		param.easing.some(isNonLinearEasing)
	);
};

const getRequiredRemotionImports = (
	effects: EffectClipboardSnapshot[],
): Set<RemotionImportName> => {
	const requiredImports = new Set<RemotionImportName>();

	for (const effect of effects) {
		for (const param of Object.values(effect.params)) {
			if (param.type !== 'keyframed') {
				continue;
			}

			requiredImports.add('useCurrentFrame');
			requiredImports.add(param.interpolationFunction);
			if (keyframedParamNeedsEasingImport(param)) {
				requiredImports.add('Easing');
			}
		}
	}

	return requiredImports;
};

const ensureRemotionImportLocalNames = ({
	ast,
	requiredImports,
}: {
	ast: File;
	requiredImports: Set<RemotionImportName>;
}): RemotionLocalNames => {
	const localNames: RemotionLocalNames = {};
	for (const importedName of requiredImports) {
		localNames[importedName] = ensureNamedImport({
			ast,
			importedName,
			sourcePath: 'remotion',
			localName: importedName,
		});
	}

	return localNames;
};

const makeEasingExpression = ({
	easing,
	easingLocalName,
}: {
	easing: EffectClipboardKeyframedParam['easing'][number];
	easingLocalName: string;
}): ExpressionKind => {
	if (easing === 'linear') {
		return b.memberExpression(
			b.identifier(easingLocalName),
			b.identifier('linear'),
		) as ExpressionKind;
	}

	return b.callExpression(
		b.memberExpression(b.identifier(easingLocalName), b.identifier('bezier')),
		easing.map((value) => parseValueExpression(value)) as never,
	) as ExpressionKind;
};

const makeKeyframedOptions = ({
	param,
	remotionLocalNames,
}: {
	param: EffectClipboardKeyframedParam;
	remotionLocalNames: RemotionLocalNames;
}): ObjectExpression | null => {
	const properties: ObjectProperty[] = [];

	if (param.interpolationFunction !== 'interpolateColors') {
		if (param.clamping.left !== 'extend') {
			properties.push(
				b.objectProperty(
					b.identifier('extrapolateLeft'),
					b.stringLiteral(param.clamping.left),
				) as ObjectProperty,
			);
		}

		if (param.clamping.right !== 'extend') {
			properties.push(
				b.objectProperty(
					b.identifier('extrapolateRight'),
					b.stringLiteral(param.clamping.right),
				) as ObjectProperty,
			);
		}

		if (keyframedParamNeedsEasingImport(param)) {
			const easingLocalName = remotionLocalNames.Easing ?? 'Easing';
			properties.push(
				b.objectProperty(
					b.identifier('easing'),
					b.arrayExpression(
						param.easing.map((easing) =>
							makeEasingExpression({easing, easingLocalName}),
						) as never,
					),
				) as ObjectProperty,
			);
		}
	}

	if (param.posterize !== undefined) {
		properties.push(
			b.objectProperty(
				b.identifier('posterize'),
				parseValueExpression(param.posterize) as never,
			) as ObjectProperty,
		);
	}

	if (properties.length === 0) {
		return null;
	}

	return b.objectExpression(properties as never) as ObjectExpression;
};

const makeKeyframedExpression = ({
	param,
	remotionLocalNames,
}: {
	param: EffectClipboardKeyframedParam;
	remotionLocalNames: RemotionLocalNames;
}): ExpressionKind => {
	const expectedEasingCount = Math.max(0, param.keyframes.length - 1);
	if (param.easing.length !== expectedEasingCount) {
		throw new Error('Cannot paste keyframed effect: invalid easing metadata');
	}

	const calleeName =
		remotionLocalNames[param.interpolationFunction] ??
		param.interpolationFunction;
	const args: ExpressionKind[] = [
		b.identifier('frame') as ExpressionKind,
		b.arrayExpression(
			param.keyframes.map((keyframe) =>
				parseValueExpression(keyframe.frame),
			) as never,
		) as ExpressionKind,
		b.arrayExpression(
			param.keyframes.map((keyframe) =>
				parseValueExpression(keyframe.value),
			) as never,
		) as ExpressionKind,
	];
	const options = makeKeyframedOptions({param, remotionLocalNames});
	if (options) {
		args.push(options as ExpressionKind);
	}

	return b.callExpression(
		b.identifier(calleeName),
		args as never,
	) as ExpressionKind;
};

const makeParamExpression = ({
	param,
	remotionLocalNames,
}: {
	param: EffectClipboardParam;
	remotionLocalNames: RemotionLocalNames;
}): ExpressionKind => {
	if (param.type === 'static') {
		return parseValueExpression(param.value);
	}

	return makeKeyframedExpression({param, remotionLocalNames});
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
