import type {File} from '@babel/types';
import type {namedTypes} from 'ast-types';
import * as recast from 'recast';
import {NoReactInternals} from 'remotion/no-react';
import type {CodemodElement} from './codemod-element';
import type {CodemodValue} from './codemod-value';
import {ensureOfficialNamedImport} from './sequence-props/imports';
import {parseValueExpression} from './update-nested-prop';

const b = recast.types.builders;

const isSerializedToken = (value: string) =>
	value.startsWith(NoReactInternals.FILE_TOKEN) ||
	value.startsWith(NoReactInternals.DATE_TOKEN);

const containsFileToken = (value: CodemodValue): boolean => {
	if (typeof value === 'string') {
		return value.startsWith(NoReactInternals.FILE_TOKEN);
	}

	if (Array.isArray(value)) {
		return value.some(containsFileToken);
	}

	if (typeof value === 'object' && value !== null) {
		return Object.values(value).some(containsFileToken);
	}

	return false;
};

const buildJsxName = (
	localName: string,
): namedTypes.JSXIdentifier | namedTypes.JSXMemberExpression => {
	const [root, ...members] = localName.split('.');
	return members.reduce<
		namedTypes.JSXIdentifier | namedTypes.JSXMemberExpression
	>(
		(object, property) =>
			b.jsxMemberExpression(object, b.jsxIdentifier(property)),
		b.jsxIdentifier(root),
	);
};

const buildAttributeName = (name: string) => {
	const [namespace, local] = name.split(':');
	return local === undefined
		? b.jsxIdentifier(name)
		: b.jsxNamespacedName(b.jsxIdentifier(namespace), b.jsxIdentifier(local));
};

// Text that JSX can hold verbatim. Everything else is wrapped in a string
// expression so braces, angle brackets and surrounding whitespace survive.
const canBeJsxText = (text: string) =>
	text.length > 0 && text === text.trim() && !/[{}<>&\r\n]/.test(text);

/**
 * Converts an element description into a Recast JSX element and adds the
 * imports it needs to the AST. The local names in the returned element account
 * for existing bindings, so aliases are used on conflicts.
 */
export const buildJsxElement = ({
	ast,
	element,
}: {
	ast: File;
	element: CodemodElement;
}): namedTypes.JSXElement => {
	let localName = element.component;
	if (element.importPath !== null) {
		const [preferredLocalName, ...members] = element.component.split('.');
		localName = [
			ensureOfficialNamedImport({
				ast,
				importedName: element.importName ?? preferredLocalName,
				sourcePath: element.importPath,
				preferredLocalName,
			}),
			...members,
		].join('.');
	}

	const attributes = Object.entries(element.props).map(([name, value]) => {
		if (typeof value === 'string' && !isSerializedToken(value)) {
			return b.jsxAttribute(buildAttributeName(name), b.stringLiteral(value));
		}

		const expression = parseValueExpression(value);
		if (containsFileToken(value)) {
			// The serializer writes `staticFile(...)`; point the calls at the
			// import's local name if that name is taken in this file.
			const staticFileLocalName = ensureOfficialNamedImport({
				ast,
				importedName: 'staticFile',
				sourcePath: 'remotion',
				preferredLocalName: 'staticFile',
			});
			if (staticFileLocalName !== 'staticFile') {
				recast.types.visit(expression, {
					visitCallExpression(path) {
						const {callee} = path.node;
						if (callee.type === 'Identifier' && callee.name === 'staticFile') {
							callee.name = staticFileLocalName;
						}

						this.traverse(path);
					},
				});
			}
		}

		return b.jsxAttribute(
			buildAttributeName(name),
			b.jsxExpressionContainer(expression),
		);
	});
	const children = element.children.map(
		(
			child,
		):
			| namedTypes.JSXElement
			| namedTypes.JSXText
			| namedTypes.JSXExpressionContainer => {
			if (typeof child !== 'string') {
				return buildJsxElement({ast, element: child});
			}

			return canBeJsxText(child)
				? b.jsxText(child)
				: b.jsxExpressionContainer(b.stringLiteral(child));
		},
	);
	const selfClosing = children.length === 0;

	return b.jsxElement(
		b.jsxOpeningElement(buildJsxName(localName), attributes, selfClosing),
		selfClosing ? null : b.jsxClosingElement(buildJsxName(localName)),
		children,
	);
};
