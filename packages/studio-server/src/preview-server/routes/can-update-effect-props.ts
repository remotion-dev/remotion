import {readFileSync} from 'node:fs';
import type {
	CallExpression,
	Expression,
	File,
	JSXAttribute,
	JSXOpeningElement,
	ObjectExpression,
	ObjectProperty,
} from '@babel/types';
import type {
	CanUpdateEffectPropsResponse,
	CanUpdateSequencePropStatus,
	SequenceNodePath,
	InteractivitySchema,
	VideoConfigValues,
} from 'remotion';
import {parseAst} from '../../codemods/parse-ast';
import {
	enumerateEffectArrayElements,
	type EffectArrayElement,
} from '../../codemods/update-effect-props/update-effect-props';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import {parseVideoConfigNumericExpression} from '../../helpers/video-config-numeric-expression';
import {
	getVideoConfigIdentifierValues,
	type VideoConfigIdentifierValues,
} from '../../helpers/video-config-values';
import {
	extractStaticValue,
	findJsxElementAtNodePath,
	getComputedStatus,
	isStaticValue,
} from './can-update-sequence-props';

const staticStatus = (codeValue: unknown): CanUpdateSequencePropStatus => ({
	status: 'static',
	codeValue,
});

const findEffectsAttr = (jsx: JSXOpeningElement): JSXAttribute | null => {
	for (const attr of jsx.attributes) {
		if (attr.type !== 'JSXAttribute') {
			continue;
		}

		if (attr.name.type === 'JSXIdentifier' && attr.name.name === 'effects') {
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

const getImportedName = (specifier: {
	readonly imported?: {
		readonly type: string;
		readonly name?: string;
		readonly value?: string;
	};
}) => {
	if (!specifier.imported) {
		return null;
	}

	if (specifier.imported.type === 'Identifier') {
		return specifier.imported.name ?? null;
	}

	return specifier.imported.value ?? null;
};

const resolveEffectImport = ({
	ast,
	call,
	fallbackCallee,
}: {
	ast: File;
	call: CallExpression;
	fallbackCallee: string;
}): {callee: string; importPath: string | null} => {
	const {callee} = call;

	if (callee.type === 'Identifier') {
		const localName = callee.name;
		for (const node of ast.program.body) {
			if (node.type !== 'ImportDeclaration') {
				continue;
			}

			const matchingSpecifier = node.specifiers?.find((specifier) => {
				return (
					specifier.type === 'ImportSpecifier' &&
					specifier.local?.name === localName
				);
			});

			if (matchingSpecifier?.type === 'ImportSpecifier') {
				return {
					callee: getImportedName(matchingSpecifier) ?? fallbackCallee,
					importPath: String(node.source.value),
				};
			}
		}
	}

	if (
		callee.type === 'MemberExpression' &&
		callee.object.type === 'Identifier' &&
		callee.property.type === 'Identifier' &&
		!callee.computed
	) {
		const namespaceName = callee.object.name;
		for (const node of ast.program.body) {
			if (node.type !== 'ImportDeclaration') {
				continue;
			}

			const matchingSpecifier = node.specifiers?.find((specifier) => {
				return (
					specifier.type === 'ImportNamespaceSpecifier' &&
					specifier.local?.name === namespaceName
				);
			});

			if (matchingSpecifier) {
				return {
					callee: callee.property.name,
					importPath: String(node.source.value),
				};
			}
		}
	}

	return {callee: fallbackCallee, importPath: null};
};

const getPropsFromObjectExpression = ({
	ast,
	objExpr,
	keys,
	videoConfigValues,
}: {
	ast: File;
	objExpr: ObjectExpression;
	keys: string[];
	videoConfigValues: VideoConfigIdentifierValues;
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
			out[key] = staticStatus(undefined);
			continue;
		}

		const valueExpr = prop.value as Expression;
		if (!isStaticValue(valueExpr)) {
			const numericExpression = parseVideoConfigNumericExpression({
				node: valueExpr,
				videoConfigValues,
			});
			out[key] = numericExpression
				? {
						status: 'static',
						codeValue: numericExpression.value,
						...(numericExpression.type === 'literal'
							? {}
							: {numericExpression}),
					}
				: getComputedStatus(valueExpr, ast, videoConfigValues);
			continue;
		}

		out[key] = {
			status: 'static',
			codeValue: extractStaticValue(valueExpr),
		};
	}

	return out;
};

export const computeEffectPropStatus = ({
	ast,
	jsx,
	effectIndex,
	keys,
	videoConfigValues,
}: {
	ast: File;
	jsx: JSXOpeningElement;
	effectIndex: number;
	keys: string[];
	videoConfigValues: VideoConfigIdentifierValues;
}): CanUpdateEffectPropsResponse => {
	const attr = findEffectsAttr(jsx);
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
	const effectImport = resolveEffectImport({
		ast,
		call,
		fallbackCallee: target.callee,
	});
	if (call.arguments.length === 0) {
		const emptyProps: Record<string, CanUpdateSequencePropStatus> = {};
		for (const key of keys) {
			emptyProps[key] = staticStatus(undefined);
		}

		return {
			canUpdate: true,
			callee: effectImport.callee,
			importPath: effectImport.importPath,
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
		ast,
		objExpr: firstArg as ObjectExpression,
		keys,
		videoConfigValues,
	});

	return {
		canUpdate: true,
		effectIndex,
		callee: effectImport.callee,
		importPath: effectImport.importPath,
		props: resolvedProps,
	};
};

export const computeEffectPropsStatusesFromContent = ({
	fileContents,
	sequenceNodePath,
	effects,
	keysFor,
	videoConfigValues,
}: {
	fileContents: string;
	sequenceNodePath: SequenceNodePath;
	effects: InteractivitySchema[];
	keysFor: (effect: InteractivitySchema) => string[];
	videoConfigValues: VideoConfigValues | null;
}): CanUpdateEffectPropsResponse[] => {
	const ast = parseAst(fileContents);
	const videoConfigIdentifierValues = getVideoConfigIdentifierValues({
		ast,
		videoConfigValues,
	});
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
			ast,
			jsx,
			effectIndex,
			keys: keysFor(effect),
			videoConfigValues: videoConfigIdentifierValues,
		}),
	);
};

export const computeEffectPropsStatusesFromFile = ({
	fileName,
	sequenceNodePath,
	effects,
	keysFor,
	remotionRoot,
	videoConfigValues,
}: {
	fileName: string;
	sequenceNodePath: SequenceNodePath;
	effects: InteractivitySchema[];
	keysFor: (effect: InteractivitySchema) => string[];
	remotionRoot: string;
	videoConfigValues: VideoConfigValues | null;
}): CanUpdateEffectPropsResponse[] => {
	const {absolutePath} = resolveFileInsideProject({
		remotionRoot,
		fileName,
		action: 'read',
	});

	const fileContents = readFileSync(absolutePath, 'utf-8');
	return computeEffectPropsStatusesFromContent({
		fileContents,
		sequenceNodePath,
		effects,
		keysFor,
		videoConfigValues,
	});
};
