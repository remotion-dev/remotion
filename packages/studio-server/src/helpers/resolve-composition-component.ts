import fs from 'node:fs';
import path from 'node:path';
import type {
	File,
	ImportDeclaration,
	JSXAttribute,
	JSXElement,
} from '@babel/types';
import * as recast from 'recast';
import {parseAst} from '../codemods/parse-ast';

type SourceLocation = {
	line: number;
	column: number;
};

type NodeWithLocation = {
	loc?: {
		start: {
			line: number;
			column: number;
		};
	} | null;
};

export type ResolvedCompositionComponent = {
	source: string;
	line: number;
	column: number;
};

type ImportTarget = {
	importPath: string;
	exportName: string | 'default';
};

const allowedFileExtensions = new Set(['.tsx', '.ts', '.jsx', '.js']);
const extensionsToProbe = ['.tsx', '.ts', '.jsx', '.js'];

const isInRemotionRoot = ({
	remotionRoot,
	fileName,
}: {
	remotionRoot: string;
	fileName: string;
}) => {
	const relativePath = path.relative(remotionRoot, fileName);
	return !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
};

const readSourceFile = ({
	remotionRoot,
	fileName,
}: {
	remotionRoot: string;
	fileName: string;
}) => {
	const resolved = path.resolve(remotionRoot, fileName);
	if (!isInRemotionRoot({remotionRoot, fileName: resolved})) {
		throw new Error(`Not allowed to open ${fileName}`);
	}

	if (!allowedFileExtensions.has(path.extname(resolved))) {
		throw new Error(`Not allowed to open ${fileName}`);
	}

	return fs.promises.readFile(resolved, 'utf-8');
};

const getAttributeName = (attribute: JSXAttribute) => {
	if (attribute.name.type !== 'JSXIdentifier') {
		return null;
	}

	return attribute.name.name;
};

const findAttribute = (element: JSXElement, name: string) => {
	return element.openingElement.attributes.find((attribute) => {
		if (attribute.type !== 'JSXAttribute') {
			return false;
		}

		return getAttributeName(attribute) === name;
	}) as JSXAttribute | undefined;
};

const getStringAttributeValue = (element: JSXElement, name: string) => {
	const attribute = findAttribute(element, name);
	if (!attribute?.value) {
		return null;
	}

	if (attribute.value.type === 'StringLiteral') {
		return attribute.value.value;
	}

	if (
		attribute.value.type === 'JSXExpressionContainer' &&
		attribute.value.expression.type === 'StringLiteral'
	) {
		return attribute.value.expression.value;
	}

	return null;
};

const findCompositionElement = ({
	ast,
	compositionId,
}: {
	ast: File;
	compositionId: string;
}) => {
	let found: JSXElement | null = null;

	recast.types.visit(ast, {
		visitJSXElement(astPath) {
			if (found) {
				return false;
			}

			const node = astPath.node as JSXElement;
			const openingName = node.openingElement.name;
			if (
				openingName.type === 'JSXIdentifier' &&
				(openingName.name === 'Composition' || openingName.name === 'Still') &&
				getStringAttributeValue(node, 'id') === compositionId
			) {
				found = node;
				return false;
			}

			this.traverse(astPath);
			return undefined;
		},
	});

	return found;
};

const getComponentIdentifier = (element: JSXElement) => {
	const attribute = findAttribute(element, 'component');
	if (
		!attribute?.value ||
		attribute.value.type !== 'JSXExpressionContainer' ||
		attribute.value.expression.type !== 'Identifier'
	) {
		return null;
	}

	return attribute.value.expression.name;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null;
};

const findDynamicImportPath = (value: unknown): string | null => {
	if (!isRecord(value)) {
		return null;
	}

	if (
		value.type === 'CallExpression' &&
		isRecord(value.callee) &&
		value.callee.type === 'Import' &&
		Array.isArray(value.arguments) &&
		isRecord(value.arguments[0]) &&
		value.arguments[0].type === 'StringLiteral' &&
		typeof value.arguments[0].value === 'string'
	) {
		return value.arguments[0].value;
	}

	for (const [key, child] of Object.entries(value)) {
		if (
			key === 'loc' ||
			key === 'start' ||
			key === 'end' ||
			key === 'comments' ||
			key === 'leadingComments' ||
			key === 'trailingComments' ||
			key === 'innerComments' ||
			key === 'extra' ||
			key === 'original'
		) {
			continue;
		}

		if (Array.isArray(child)) {
			for (const item of child) {
				const nestedResult = findDynamicImportPath(item);
				if (nestedResult) {
					return nestedResult;
				}
			}

			continue;
		}

		const childResult = findDynamicImportPath(child);
		if (childResult) {
			return childResult;
		}
	}

	return null;
};

const getLazyImportPath = (element: JSXElement) => {
	const attribute = findAttribute(element, 'lazyComponent');
	if (!attribute?.value || attribute.value.type !== 'JSXExpressionContainer') {
		return null;
	}

	return findDynamicImportPath(attribute.value.expression);
};

const findImportTarget = ({
	ast,
	componentName,
}: {
	ast: File;
	componentName: string;
}): ImportTarget | null => {
	let found: ImportTarget | null = null;

	recast.types.visit(ast, {
		visitImportDeclaration(astPath) {
			if (found) {
				return false;
			}

			const node = astPath.node as ImportDeclaration;
			if (typeof node.source.value !== 'string') {
				return false;
			}

			const matchingSpecifier = node.specifiers?.find((specifier) => {
				return specifier.local?.name === componentName;
			});
			if (!matchingSpecifier) {
				return false;
			}

			if (matchingSpecifier.type === 'ImportDefaultSpecifier') {
				found = {
					importPath: node.source.value,
					exportName: 'default',
				};
				return false;
			}

			if (
				matchingSpecifier.type === 'ImportSpecifier' &&
				matchingSpecifier.imported.type === 'Identifier'
			) {
				found = {
					importPath: node.source.value,
					exportName: matchingSpecifier.imported.name,
				};
				return false;
			}

			if (
				matchingSpecifier.type === 'ImportSpecifier' &&
				matchingSpecifier.imported.type === 'StringLiteral'
			) {
				found = {
					importPath: node.source.value,
					exportName: matchingSpecifier.imported.value,
				};
				return false;
			}

			return false;
		},
	});

	return found;
};

const resolveImportPath = ({
	importPath,
	fromFile,
}: {
	importPath: string;
	fromFile: string;
}) => {
	if (!importPath.startsWith('.')) {
		throw new Error(`Cannot resolve non-relative import ${importPath}`);
	}

	const basePath = path.resolve(path.dirname(fromFile), importPath);
	const candidates = path.extname(basePath)
		? [basePath]
		: [
				...extensionsToProbe.map((extension) => `${basePath}${extension}`),
				...extensionsToProbe.map((extension) =>
					path.join(basePath, `index${extension}`),
				),
			];

	const existingFile = candidates.find((candidate) => {
		return fs.existsSync(candidate) && fs.statSync(candidate).isFile();
	});
	if (!existingFile) {
		throw new Error(`Could not find imported component file ${importPath}`);
	}

	return existingFile;
};

const locationFromNode = (node: NodeWithLocation): SourceLocation | null => {
	if (!node.loc) {
		return null;
	}

	return {
		line: node.loc.start.line,
		column: node.loc.start.column,
	};
};

const findLocalSymbolLocation = ({
	ast,
	name,
}: {
	ast: File;
	name: string;
}): SourceLocation | null => {
	let location: SourceLocation | null = null;

	recast.types.visit(ast, {
		visitVariableDeclarator(astPath) {
			if (location) {
				return false;
			}

			const {node} = astPath;
			if (node.id.type === 'Identifier' && node.id.name === name) {
				location = locationFromNode(node);
				return false;
			}

			this.traverse(astPath);
			return undefined;
		},
		visitFunctionDeclaration(astPath) {
			if (location) {
				return false;
			}

			const {node} = astPath;
			if (node.id?.name === name) {
				location = locationFromNode(node);
				return false;
			}

			this.traverse(astPath);
			return undefined;
		},
		visitClassDeclaration(astPath) {
			if (location) {
				return false;
			}

			const {node} = astPath;
			if (node.id?.name === name) {
				location = locationFromNode(node);
				return false;
			}

			this.traverse(astPath);
			return undefined;
		},
	});

	return location;
};

const findDefaultExportLocation = (ast: File): SourceLocation | null => {
	let location: SourceLocation | null = null;
	let exportedIdentifier: string | null = null;

	recast.types.visit(ast, {
		visitExportDefaultDeclaration(astPath) {
			if (location || exportedIdentifier) {
				return false;
			}

			const {node} = astPath;
			if (node.declaration.type === 'Identifier') {
				exportedIdentifier = node.declaration.name;
				return false;
			}

			location = locationFromNode(node.declaration) ?? locationFromNode(node);
			return false;
		},
	});

	if (exportedIdentifier) {
		return findLocalSymbolLocation({ast, name: exportedIdentifier});
	}

	return location;
};

const getComponentLocationInFile = async ({
	remotionRoot,
	fileName,
	exportName,
}: {
	remotionRoot: string;
	fileName: string;
	exportName: string | 'default';
}): Promise<ResolvedCompositionComponent> => {
	const input = await readSourceFile({remotionRoot, fileName});
	const ast = parseAst(input);
	const location =
		exportName === 'default'
			? findDefaultExportLocation(ast)
			: findLocalSymbolLocation({ast, name: exportName});

	return {
		source: path.relative(remotionRoot, fileName),
		line: location?.line ?? 1,
		column: location?.column ?? 0,
	};
};

export const resolveCompositionComponent = async ({
	remotionRoot,
	compositionFile,
	compositionId,
}: {
	remotionRoot: string;
	compositionFile: string;
	compositionId: string;
}): Promise<ResolvedCompositionComponent> => {
	const compositionFileName = path.resolve(remotionRoot, compositionFile);
	const input = await readSourceFile({
		remotionRoot,
		fileName: compositionFileName,
	});
	const ast = parseAst(input);
	const compositionElement = findCompositionElement({ast, compositionId});
	if (!compositionElement) {
		throw new Error(`Could not find composition "${compositionId}"`);
	}

	const lazyImportPath = getLazyImportPath(compositionElement);
	if (lazyImportPath) {
		const lazyComponentFile = resolveImportPath({
			importPath: lazyImportPath,
			fromFile: compositionFileName,
		});
		return getComponentLocationInFile({
			remotionRoot,
			fileName: lazyComponentFile,
			exportName: 'default',
		});
	}

	const componentName = getComponentIdentifier(compositionElement);
	if (!componentName) {
		throw new Error(
			`Could not find a component prop for composition "${compositionId}"`,
		);
	}

	const importTarget = findImportTarget({ast, componentName});
	if (!importTarget) {
		return getComponentLocationInFile({
			remotionRoot,
			fileName: compositionFileName,
			exportName: componentName,
		});
	}

	const importedComponentFile = resolveImportPath({
		importPath: importTarget.importPath,
		fromFile: compositionFileName,
	});

	return getComponentLocationInFile({
		remotionRoot,
		fileName: importedComponentFile,
		exportName: importTarget.exportName,
	});
};
