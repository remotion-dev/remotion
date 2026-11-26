import type {
	Expression,
	ImportDeclaration,
	ImportSpecifier,
	JSXOpeningElement,
	Node,
	ObjectExpression,
	ObjectProperty,
} from '@babel/types';
import {LINEAR_KEYFRAME_EASING} from '@remotion/studio-shared/keyframe-easing-presets';
import type {NodePath} from 'ast-types';
import {getImportedName} from './imports';
import {parseKeyframeEasingExpression} from './parse-keyframe-easing-expression';

export const transitionComponentIdentity =
	'dev.remotion.transitions.TransitionSeries.Transition';

const isImportedReference = (
	path: NodePath,
	reference: Node,
	sourceName: string,
	importedName: string,
): boolean => {
	const binding =
		reference.type === 'MemberExpression' ? reference.object : reference;
	if (binding.type !== 'Identifier') return false;
	const declaration = path.scope.lookup(binding.name)?.getBindings()[
		binding.name
	]?.[0];
	const specifier = declaration?.parent;
	const source = specifier?.parent?.node as ImportDeclaration | undefined;
	if (
		source?.type !== 'ImportDeclaration' ||
		source.source.value !== sourceName
	)
		return false;
	return reference.type === 'Identifier'
		? specifier?.node.type === 'ImportSpecifier' &&
				getImportedName(specifier.node as ImportSpecifier) === importedName
		: specifier?.node.type === 'ImportNamespaceSpecifier' &&
				reference.type === 'MemberExpression' &&
				!reference.computed &&
				reference.property.type === 'Identifier' &&
				reference.property.name === importedName;
};

const getLinearTimingOption = (
	jsxPath: NodePath,
	key: 'durationInFrames' | 'easing',
): {options: ObjectExpression; property: ObjectProperty | null} | null => {
	const element = jsxPath.node as JSXOpeningElement;
	for (const attribute of [...element.attributes].reverse()) {
		if (attribute.type === 'JSXSpreadAttribute') return null;
		if (
			attribute.name.type !== 'JSXIdentifier' ||
			attribute.name.name !== 'timing'
		)
			continue;
		const call =
			attribute.value?.type === 'JSXExpressionContainer'
				? attribute.value.expression
				: null;
		if (call?.type !== 'CallExpression' || call.arguments.length !== 1)
			return null;
		if (
			!isImportedReference(
				jsxPath,
				call.callee,
				'@remotion/transitions',
				'linearTiming',
			)
		)
			return null;
		const options = call.arguments[0];
		if (options.type !== 'ObjectExpression') return null;
		for (const prop of [...options.properties].reverse()) {
			// A later spread or computed key can override this option.
			if (prop.type === 'SpreadElement' || prop.computed) return null;
			const name =
				prop.key.type === 'Identifier'
					? prop.key.name
					: prop.key.type === 'StringLiteral'
						? prop.key.value
						: null;
			if (name === key) {
				return prop.type === 'ObjectProperty'
					? {options, property: prop}
					: null;
			}
		}

		return {options, property: null};
	}

	return null;
};

export const getLinearTimingDurationLiteral = (jsxPath: NodePath) => {
	const value = getLinearTimingOption(jsxPath, 'durationInFrames')?.property
		?.value;
	return value?.type === 'NumericLiteral' ? value : null;
};

export const getLinearTimingEasing = (jsxPath: NodePath) => {
	const option = getLinearTimingOption(jsxPath, 'easing');
	if (!option) return null;
	const easing = option.property
		? parseKeyframeEasingExpression(
				option.property.value as Expression,
				(receiver) =>
					isImportedReference(jsxPath, receiver, 'remotion', 'Easing'),
			)
		: LINEAR_KEYFRAME_EASING;
	return easing ? {...option, easing} : null;
};
