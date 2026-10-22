import type {File, JSXElement, JSXFragment} from '@babel/types';
import * as recast from 'recast';
import {Interactive} from 'remotion';
import {getJsxComponentIdentity} from './sequence-props/jsx-component-identity';

// Only recognize roots whose style forwarding is part of their known contract.
// A style attribute on an arbitrary component does not establish that contract.
export const getStyleablePrecompositionRoot = ({
	ast,
	children,
}: {
	ast: File;
	children: JSXFragment['children'];
}): {element: JSXElement; handlesTiming: boolean} | null => {
	const content = children.filter(
		(child) => child.type !== 'JSXText' || child.value.trim() !== '',
	);
	if (content.length !== 1 || content[0].type !== 'JSXElement') {
		return null;
	}

	const element = content[0];
	const {name, attributes} = element.openingElement;
	if (
		attributes.some(
			(attribute) =>
				attribute.type === 'JSXSpreadAttribute' ||
				attribute.name.type !== 'JSXIdentifier' ||
				['key', 'ref', 'controls'].includes(attribute.name.name),
		) ||
		attributes.filter(
			(attribute) =>
				attribute.type === 'JSXAttribute' && attribute.name.name === 'style',
		).length > 1
	) {
		return null;
	}

	if (name.type === 'JSXIdentifier' && /^[a-z]/.test(name.name)) {
		return {element, handlesTiming: false};
	}

	let identifier = name;
	while (identifier.type === 'JSXMemberExpression') {
		identifier = identifier.object;
	}

	if (identifier.type !== 'JSXIdentifier') {
		return null;
	}

	let isTopLevelBinding = false;
	recast.visit(ast, {
		visitJSXElement(path) {
			if (path.node === element) {
				isTopLevelBinding =
					path.scope.lookup(identifier.name)?.path.node === ast.program;
				return false;
			}

			return this.traverse(path);
		},
	});
	if (!isTopLevelBinding) {
		return null;
	}

	const identity = getJsxComponentIdentity({
		ast,
		jsxElement: element.openingElement,
	});
	const knownIdentities = new Set([
		'dev.remotion.remotion.AbsoluteFill',
		...Object.keys(Interactive)
			.filter((key) => /^[A-Z]/.test(key))
			.map((key) => `dev.remotion.remotion.Interactive.${key}`),
	]);
	return identity !== null && knownIdentities.has(identity)
		? {element, handlesTiming: true}
		: null;
};
