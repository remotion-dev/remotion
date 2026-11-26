import type {
	ImportDeclaration,
	ImportSpecifier,
	JSXOpeningElement,
	NumericLiteral,
} from '@babel/types';
import type {NodePath} from 'ast-types';
import {getImportedName} from './imports';

export const transitionComponentIdentity =
	'dev.remotion.transitions.TransitionSeries.Transition';

export const getLinearTimingDurationLiteral = (
	jsxPath: NodePath,
): NumericLiteral | null => {
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
		const binding =
			call.callee.type === 'MemberExpression'
				? call.callee.object
				: call.callee;
		if (binding.type !== 'Identifier') return null;
		const declaration = jsxPath.scope.lookup(binding.name)?.getBindings()[
			binding.name
		]?.[0];
		const specifier = declaration?.parent;
		const source = specifier?.parent?.node as ImportDeclaration | undefined;
		if (
			source?.type !== 'ImportDeclaration' ||
			source.source.value !== '@remotion/transitions'
		)
			return null;
		const {callee} = call;
		const isLinearTiming =
			callee.type === 'Identifier'
				? specifier?.node.type === 'ImportSpecifier' &&
					getImportedName(specifier.node as ImportSpecifier) === 'linearTiming'
				: specifier?.node.type === 'ImportNamespaceSpecifier' &&
					callee.type === 'MemberExpression' &&
					!callee.computed &&
					callee.property.type === 'Identifier' &&
					callee.property.name === 'linearTiming';
		if (!isLinearTiming) return null;
		const options = call.arguments[0];
		if (options.type !== 'ObjectExpression') return null;
		for (const prop of [...options.properties].reverse()) {
			// A later spread or computed key can override the duration.
			if (prop.type === 'SpreadElement' || prop.computed) return null;
			const name =
				prop.key.type === 'Identifier'
					? prop.key.name
					: prop.key.type === 'StringLiteral'
						? prop.key.value
						: null;
			if (name === 'durationInFrames') {
				return prop.type === 'ObjectProperty' &&
					prop.value.type === 'NumericLiteral'
					? prop.value
					: null;
			}
		}

		return null;
	}

	return null;
};
