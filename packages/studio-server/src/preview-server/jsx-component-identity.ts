import type {
	File,
	JSXIdentifier,
	JSXMemberExpression,
	JSXOpeningElement,
} from '@babel/types';
import type {JsxComponentIdentity} from 'remotion';
import {getImportedName} from '../helpers/imports';

export class JsxElementIdentityMismatchError extends Error {
	constructor() {
		super('JSX element identity changed');
	}
}

const jsxMemberToString = (
	expr: JSXMemberExpression | JSXIdentifier,
): string => {
	if (expr.type === 'JSXIdentifier') {
		return expr.name;
	}

	return `${jsxMemberToString(expr.object)}.${expr.property.name}`;
};

const getJsxRootIdentifier = (
	expr: JSXMemberExpression | JSXIdentifier,
): JSXIdentifier => {
	if (expr.type === 'JSXIdentifier') {
		return expr;
	}

	return getJsxRootIdentifier(expr.object);
};

const getTagName = (node: JSXOpeningElement): string | null => {
	if (node.name.type === 'JSXIdentifier') {
		return node.name.name;
	}

	if (node.name.type === 'JSXMemberExpression') {
		return jsxMemberToString(node.name);
	}

	return null;
};

const getMemberPath = (tagName: string): string => {
	const dotIndex = tagName.indexOf('.');
	return dotIndex === -1 ? '' : tagName.slice(dotIndex + 1);
};

const getMemberPathAfterImportName = ({
	tagName,
	importName,
}: {
	tagName: string;
	importName: string;
}): string => {
	const parts = tagName.split('.');
	const importNameIndex = parts.indexOf(importName);
	if (importNameIndex === -1) {
		return getMemberPath(tagName);
	}

	return parts.slice(importNameIndex + 1).join('.');
};

const sourcePathToIdentityPrefix = (sourcePath: string): string | null => {
	if (sourcePath === 'remotion') {
		return 'dev.remotion.remotion';
	}

	if (sourcePath.startsWith('@remotion/')) {
		const packageName = sourcePath
			.slice('@remotion/'.length)
			.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
		return `dev.remotion.${packageName}`;
	}

	return null;
};

const makeImportedIdentity = ({
	sourcePath,
	importName,
	memberPath,
}: {
	sourcePath: string;
	importName: string;
	memberPath: string;
}): JsxComponentIdentity | null => {
	const prefix = sourcePathToIdentityPrefix(sourcePath);
	if (prefix === null) {
		return null;
	}

	return [prefix, importName, memberPath].filter(Boolean).join('.');
};

export const getJsxComponentIdentity = ({
	ast,
	jsxElement,
}: {
	ast: File;
	jsxElement: JSXOpeningElement;
}): JsxComponentIdentity | null => {
	const tagName = getTagName(jsxElement);
	if (tagName === null) {
		return null;
	}

	const rootIdentifier =
		jsxElement.name.type === 'JSXIdentifier'
			? jsxElement.name
			: jsxElement.name.type === 'JSXMemberExpression'
				? getJsxRootIdentifier(jsxElement.name)
				: null;
	if (rootIdentifier === null) {
		return tagName;
	}

	for (const node of ast.program.body) {
		if (node.type !== 'ImportDeclaration') {
			continue;
		}

		const sourcePath = String(node.source.value);
		for (const specifier of node.specifiers) {
			if (
				specifier.type === 'ImportSpecifier' &&
				specifier.local?.name === rootIdentifier.name
			) {
				const importName = getImportedName(specifier);
				return makeImportedIdentity({
					sourcePath,
					importName,
					memberPath: getMemberPath(tagName),
				});
			}

			if (
				specifier.type === 'ImportNamespaceSpecifier' &&
				specifier.local.name === rootIdentifier.name
			) {
				const [importName, ...members] = getMemberPath(tagName).split('.');
				if (!importName) {
					return null;
				}

				return makeImportedIdentity({
					sourcePath,
					importName,
					memberPath: members.join('.'),
				});
			}

			if (
				specifier.type === 'ImportDefaultSpecifier' &&
				specifier.local.name === rootIdentifier.name
			) {
				return makeImportedIdentity({
					sourcePath,
					importName: 'default',
					memberPath: getMemberPathAfterImportName({
						tagName,
						importName: rootIdentifier.name,
					}),
				});
			}
		}
	}

	return tagName;
};

export const jsxComponentIdentitiesMatch = ({
	expected,
	actual,
}: {
	expected: JsxComponentIdentity | null;
	actual: JsxComponentIdentity | null;
}): boolean => {
	if (expected === null) {
		return true;
	}

	return expected === actual;
};
