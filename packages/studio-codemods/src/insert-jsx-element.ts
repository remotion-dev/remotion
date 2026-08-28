import type {
	ClassDeclaration,
	ExportAllDeclaration,
	ExportNamedDeclaration,
	ExportSpecifier,
	File,
	FunctionDeclaration,
	ImportDeclaration,
	ImportDefaultSpecifier,
	ImportSpecifier,
	JSXAttribute,
	JSXElement,
	JSXOpeningElement,
	JSXSpreadAttribute,
	NullLiteral,
	ObjectProperty,
	VariableDeclaration,
} from '@babel/types';
import {
	isUrl,
	type InsertJsxElementRequest,
	type InsertableCompositionElement,
	type InsertableCompositionElementPosition,
	type SequenceNodePathRemapping,
} from '@remotion/studio-shared';
import type {namedTypes} from 'ast-types';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {recastLocToOffset} from './recast-loc-to-offset';
import {
	ensureNamedImport,
	getImportedName,
	insertImportDeclaration,
} from './sequence-props/imports';
import {parseAst, parseAstForReadOnly} from './sequence-props/parse-ast';
import {stripParenthesizedExtra} from './strip-parenthesized-extra';
import {parseValueExpression} from './update-nested-prop';

type ComponentProp = Extract<
	InsertableCompositionElement,
	{type: 'component'}
>['props'][number];

export type InsertJsxElementCodemodEnvironment = {
	rootDir: string;
	dirname: (fileName: string) => string;
	extname: (fileName: string) => string;
	fileExists: (fileName: string) => boolean;
	formatFile: (input: {
		contents: string;
		prettierConfigOverride: Record<string, unknown> | null;
	}) => Promise<{output: string; formatted: boolean}>;
	isAbsolute: (fileName: string) => boolean;
	join: (...parts: string[]) => string;
	pathSeparator: string;
	readFile: (fileName: string) => Promise<string>;
	relative: (from: string, to: string) => string;
	resolve: (...parts: string[]) => string;
	svgMarkupToJsx: (markup: string) => Promise<namedTypes.JSXElement>;
};

const normalizeVirtualPath = (input: string) => {
	const hasLeadingSlash = input.startsWith('/');
	const parts: string[] = [];
	for (const part of input.replaceAll('\\', '/').split('/')) {
		if (part === '' || part === '.') {
			continue;
		}

		if (part === '..') {
			parts.pop();
			continue;
		}

		parts.push(part);
	}

	return `${hasLeadingSlash ? '/' : ''}${parts.join('/')}`;
};

const resolveVirtualPath = (...parts: string[]) => {
	let resolved = '';
	for (const part of parts) {
		if (part.startsWith('/')) {
			resolved = part;
		} else {
			resolved = `${resolved}/${part}`;
		}
	}

	return normalizeVirtualPath(resolved);
};

const virtualDirname = (fileName: string) => {
	const normalized = normalizeVirtualPath(fileName);
	const lastSlash = normalized.lastIndexOf('/');
	return lastSlash <= 0
		? normalized.startsWith('/')
			? '/'
			: ''
		: normalized.slice(0, lastSlash);
};

const relativeVirtualPath = (from: string, to: string) => {
	const fromParts = normalizeVirtualPath(from).split('/').filter(Boolean);
	const toParts = normalizeVirtualPath(to).split('/').filter(Boolean);
	let sharedParts = 0;
	while (
		sharedParts < fromParts.length &&
		sharedParts < toParts.length &&
		fromParts[sharedParts] === toParts[sharedParts]
	) {
		sharedParts++;
	}

	return [
		...fromParts.slice(sharedParts).map(() => '..'),
		...toParts.slice(sharedParts),
	].join('/');
};

export const makeInMemoryInsertJsxElementCodemodEnvironment = ({
	formatFile,
	project,
	svgMarkupToJsx,
}: {
	formatFile: InsertJsxElementCodemodEnvironment['formatFile'];
	project: {files: Record<string, string>; rootDir: string};
	svgMarkupToJsx: InsertJsxElementCodemodEnvironment['svgMarkupToJsx'];
}): InsertJsxElementCodemodEnvironment => {
	const filesByNormalizedPath = new Map(
		Object.entries(project.files).map(([fileName, contents]) => [
			normalizeVirtualPath(fileName),
			contents,
		]),
	);

	return {
		dirname: virtualDirname,
		extname: (fileName) => {
			const name = fileName.slice(fileName.lastIndexOf('/') + 1);
			const dot = name.lastIndexOf('.');
			return dot === -1 ? '' : name.slice(dot);
		},
		fileExists: (fileName) =>
			filesByNormalizedPath.has(normalizeVirtualPath(fileName)),
		formatFile,
		isAbsolute: (fileName) => fileName.startsWith('/'),
		join: (...parts) => resolveVirtualPath(...parts),
		pathSeparator: '/',
		readFile: (fileName) => {
			const contents = filesByNormalizedPath.get(
				normalizeVirtualPath(fileName),
			);
			if (contents === undefined) {
				throw new Error(`Could not read source file "${fileName}"`);
			}

			return Promise.resolve(contents);
		},
		relative: relativeVirtualPath,
		resolve: resolveVirtualPath,
		rootDir: normalizeVirtualPath(project.rootDir),
		svgMarkupToJsx,
	};
};

type SourceLocation = {
	line: number;
	column: number;
};

type SourceEdit = {
	end: number;
	replacement: string;
	start: number;
};

type ImportSnapshot = {
	declaration: ImportDeclaration;
	specifiers: NonNullable<ImportDeclaration['specifiers']>;
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
	canAddSequence: boolean;
};

export type ResolvedCompositionComponentWithFile =
	ResolvedCompositionComponent & {
		fileName: string;
		exportName: string | 'default';
	};

type ImportTarget = {
	importPath: string;
	exportName: string | 'default';
};

type ReExportTarget = {
	importPath: string;
	exportName: string | 'default';
};

const allowedFileExtensions = new Set(['.tsx', '.ts', '.jsx', '.js']);
const extensionsToProbe = ['.tsx', '.ts', '.jsx', '.js'];

const isInRemotionRoot = ({
	environment,
	fileName,
}: {
	environment: InsertJsxElementCodemodEnvironment;
	fileName: string;
}) => {
	const relativePath = environment.relative(environment.rootDir, fileName);
	return (
		!relativePath.startsWith('..') && !environment.isAbsolute(relativePath)
	);
};

const readSourceFile = ({
	environment,
	fileName,
}: {
	environment: InsertJsxElementCodemodEnvironment;
	fileName: string;
}) => {
	const resolved = environment.resolve(environment.rootDir, fileName);
	if (!isInRemotionRoot({environment, fileName: resolved})) {
		throw new Error(`Not allowed to open ${fileName}`);
	}

	if (!allowedFileExtensions.has(environment.extname(resolved))) {
		throw new Error(`Not allowed to open ${fileName}`);
	}

	return environment.readFile(resolved);
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
	return typeof value === 'object' && value !== null && !Array.isArray(value);
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

const getExportedName = (exported: unknown) => {
	if (!exported) {
		return null;
	}

	if (!isRecord(exported)) {
		return null;
	}

	if (exported.type === 'Identifier' && typeof exported.name === 'string') {
		return exported.name;
	}

	if (exported.type === 'StringLiteral' && typeof exported.value === 'string') {
		return exported.value;
	}

	return null;
};

const getSpecifierLocalName = (specifier: ExportSpecifier) => {
	if (specifier.local.type === 'Identifier') {
		return specifier.local.name;
	}

	return null;
};

const findReExportTargets = ({
	ast,
	exportName,
}: {
	ast: File;
	exportName: string | 'default';
}) => {
	const targets: ReExportTarget[] = [];

	recast.types.visit(ast, {
		visitExportNamedDeclaration(astPath) {
			const node = astPath.node as ExportNamedDeclaration;

			for (const specifier of node.specifiers) {
				if (specifier.type !== 'ExportSpecifier') {
					continue;
				}

				const exportedName = getExportedName(specifier.exported);
				if (exportedName !== exportName) {
					continue;
				}

				const localName = getSpecifierLocalName(specifier);
				if (!localName) {
					continue;
				}

				// Support barrel files that import a component and export it in a
				// separate declaration. See https://github.com/remotion-dev/remotion/issues/9172.
				if (typeof node.source?.value !== 'string') {
					const importTarget = findImportTarget({
						ast,
						componentName: localName,
					});
					if (importTarget) {
						targets.push(importTarget);
					}

					continue;
				}

				targets.push({
					importPath: node.source.value,
					exportName: localName === 'default' ? 'default' : localName,
				});
			}

			return false;
		},
		visitExportAllDeclaration(astPath) {
			const node = astPath.node as ExportAllDeclaration;
			if (typeof node.source.value !== 'string') {
				return false;
			}

			targets.push({
				importPath: node.source.value,
				exportName,
			});

			return false;
		},
	});

	return targets;
};

const resolveImportPath = ({
	environment,
	importPath,
	fromFile,
}: {
	environment: InsertJsxElementCodemodEnvironment;
	importPath: string;
	fromFile: string;
}) => {
	if (!importPath.startsWith('.')) {
		throw new Error(`Cannot resolve non-relative import ${importPath}`);
	}

	const basePath = environment.resolve(
		environment.dirname(fromFile),
		importPath,
	);
	const candidates = environment.extname(basePath)
		? [basePath]
		: [
				...extensionsToProbe.map((extension) => `${basePath}${extension}`),
				...extensionsToProbe.map((extension) =>
					environment.join(basePath, `index${extension}`),
				),
			];

	const existingFile = candidates.find(environment.fileExists);
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

	// Recast can omit the declaration location for exported functions and
	// classes, including components resolved through barrel files. The identifier
	// keeps its location. See https://github.com/remotion-dev/remotion/issues/9172.
	recast.types.visit(ast, {
		visitVariableDeclarator(astPath) {
			if (location) {
				return false;
			}

			const {node} = astPath;
			if (node.id.type === 'Identifier' && node.id.name === name) {
				location = locationFromNode(node.id);
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
				location = locationFromNode(node.id);
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
				location = locationFromNode(node.id);
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

type LocalComponentDeclaration =
	| namedTypes.VariableDeclarator
	| namedTypes.FunctionDeclaration
	| namedTypes.ClassDeclaration;

type FunctionLikeNode =
	| namedTypes.ArrowFunctionExpression
	| namedTypes.FunctionExpression
	| namedTypes.FunctionDeclaration;

type DefaultExportDeclaration =
	namedTypes.ExportDefaultDeclaration['declaration'];

const findLocalComponentDeclaration = ({
	ast,
	name,
}: {
	ast: File;
	name: string;
}): LocalComponentDeclaration | null => {
	let declaration: LocalComponentDeclaration | null = null;

	recast.types.visit(ast, {
		visitVariableDeclarator(astPath) {
			if (declaration) {
				return false;
			}

			const {node} = astPath;
			if (node.id.type === 'Identifier' && node.id.name === name) {
				declaration = node;
				return false;
			}

			this.traverse(astPath);
			return undefined;
		},
		visitFunctionDeclaration(astPath) {
			if (declaration) {
				return false;
			}

			const {node} = astPath;
			if (node.id?.name === name) {
				declaration = node;
				return false;
			}

			this.traverse(astPath);
			return undefined;
		},
		visitClassDeclaration(astPath) {
			if (declaration) {
				return false;
			}

			const {node} = astPath;
			if (node.id?.name === name) {
				declaration = node;
				return false;
			}

			this.traverse(astPath);
			return undefined;
		},
	});

	return declaration;
};

const getTopLevelReturnStatement = (
	statements: namedTypes.Statement[],
): namedTypes.ReturnStatement | null => {
	const returnStatements: namedTypes.ReturnStatement[] = [];
	for (const statement of statements) {
		if (recast.types.namedTypes.ReturnStatement.check(statement)) {
			returnStatements.push(statement);
		}
	}

	if (returnStatements.length !== 1) {
		return null;
	}

	const singleReturn = returnStatements[0];
	const finalStatement = statements.at(-1);
	if (singleReturn !== finalStatement) {
		return null;
	}

	return singleReturn;
};

const getReturnedJsxFromFunction = (
	fn: FunctionLikeNode,
): namedTypes.JSXElement | namedTypes.JSXFragment | null => {
	if (fn.type === 'ArrowFunctionExpression') {
		if (fn.body.type === 'JSXElement' || fn.body.type === 'JSXFragment') {
			return fn.body;
		}

		if (fn.body.type !== 'BlockStatement') {
			return null;
		}

		const arrowReturnStatement = getTopLevelReturnStatement(fn.body.body);
		if (!arrowReturnStatement?.argument) {
			return null;
		}

		return arrowReturnStatement.argument.type === 'JSXElement' ||
			arrowReturnStatement.argument.type === 'JSXFragment'
			? arrowReturnStatement.argument
			: null;
	}

	if (fn.body.type !== 'BlockStatement') {
		return null;
	}

	const returnStatement = getTopLevelReturnStatement(fn.body.body);
	if (!returnStatement?.argument) {
		return null;
	}

	return returnStatement.argument.type === 'JSXElement' ||
		returnStatement.argument.type === 'JSXFragment'
		? returnStatement.argument
		: null;
};

const findRenderMethod = (
	declaration: namedTypes.ClassDeclaration,
): namedTypes.ClassMethod | null => {
	const renderMethod = declaration.body.body.find((member) => {
		return (
			member.type === 'ClassMethod' &&
			member.kind === 'method' &&
			member.key.type === 'Identifier' &&
			member.key.name === 'render'
		);
	});

	return renderMethod?.type === 'ClassMethod' ? renderMethod : null;
};

const getComponentRootNode = (
	declaration: LocalComponentDeclaration | DefaultExportDeclaration,
): namedTypes.JSXElement | namedTypes.JSXFragment | null => {
	if (declaration.type === 'VariableDeclarator') {
		if (
			!declaration.init ||
			(declaration.init.type !== 'ArrowFunctionExpression' &&
				declaration.init.type !== 'FunctionExpression')
		) {
			return null;
		}

		return getReturnedJsxFromFunction(declaration.init);
	}

	if (
		declaration.type === 'ArrowFunctionExpression' ||
		declaration.type === 'FunctionExpression' ||
		declaration.type === 'FunctionDeclaration'
	) {
		return getReturnedJsxFromFunction(declaration);
	}

	if (declaration.type !== 'ClassDeclaration') {
		return null;
	}

	const renderMethod = findRenderMethod(declaration);
	if (!renderMethod) {
		return null;
	}

	const returnStatement = getTopLevelReturnStatement(renderMethod.body.body);
	if (!returnStatement?.argument) {
		return null;
	}

	return returnStatement.argument.type === 'JSXElement' ||
		returnStatement.argument.type === 'JSXFragment'
		? returnStatement.argument
		: null;
};

const createSequenceElement = (): namedTypes.JSXElement => {
	return recast.types.builders.jsxElement(
		recast.types.builders.jsxOpeningElement(
			recast.types.builders.jsxIdentifier('Sequence'),
			[],
		),
		recast.types.builders.jsxClosingElement(
			recast.types.builders.jsxIdentifier('Sequence'),
		),
		[],
	);
};

const createSequenceWithChild = ({
	child,
	sequenceLocalName,
}: {
	child: namedTypes.JSXElement;
	sequenceLocalName: string;
}): namedTypes.JSXElement => {
	return recast.types.builders.jsxElement(
		recast.types.builders.jsxOpeningElement(
			recast.types.builders.jsxIdentifier(sequenceLocalName),
			[],
		),
		recast.types.builders.jsxClosingElement(
			recast.types.builders.jsxIdentifier(sequenceLocalName),
		),
		[child],
	);
};

const createNumberAttribute = (
	name: string,
	value: number,
): namedTypes.JSXAttribute => {
	return recast.types.builders.jsxAttribute(
		recast.types.builders.jsxIdentifier(name),
		recast.types.builders.jsxExpressionContainer(
			recast.types.builders.numericLiteral(value),
		),
	);
};

const createStringAttribute = (
	name: string,
	value: string,
): namedTypes.JSXAttribute => {
	return recast.types.builders.jsxAttribute(
		recast.types.builders.jsxIdentifier(name),
		recast.types.builders.stringLiteral(value),
	);
};

const createBooleanAttribute = (
	name: string,
	value: boolean,
): namedTypes.JSXAttribute => {
	return recast.types.builders.jsxAttribute(
		recast.types.builders.jsxIdentifier(name),
		recast.types.builders.jsxExpressionContainer(
			recast.types.builders.booleanLiteral(value),
		),
	);
};

const translateDecimalPlaces = 1;

const roundTranslateCoordinate = (value: number): number => {
	const factor = 10 ** translateDecimalPlaces;
	const rounded = Math.round(value * factor) / factor;
	return Object.is(rounded, -0) ? 0 : rounded;
};

const formatTranslateValue = ({x, y}: InsertableCompositionElementPosition) =>
	`${roundTranslateCoordinate(x)}px ${roundTranslateCoordinate(y)}px`;

const createStyleAttribute = (
	properties: namedTypes.ObjectProperty[],
): namedTypes.JSXAttribute => {
	return recast.types.builders.jsxAttribute(
		recast.types.builders.jsxIdentifier('style'),
		recast.types.builders.jsxExpressionContainer(
			recast.types.builders.objectExpression(properties),
		),
	);
};

const getPositionStyleProperties = (
	position: InsertableCompositionElementPosition | null,
): namedTypes.ObjectProperty[] => {
	const properties = [
		recast.types.builders.objectProperty(
			recast.types.builders.identifier('position'),
			recast.types.builders.stringLiteral('absolute'),
		),
	];

	if (position) {
		properties.push(
			recast.types.builders.objectProperty(
				recast.types.builders.identifier('translate'),
				recast.types.builders.stringLiteral(formatTranslateValue(position)),
			),
		);
	}

	return properties;
};

const createPositionAbsoluteStyleAttribute = (
	position: InsertableCompositionElementPosition | null,
): namedTypes.JSXAttribute => {
	return createStyleAttribute(getPositionStyleProperties(position));
};

const createAssetStyleAttribute = ({
	dimensions,
	position,
}: {
	dimensions: {width: number; height: number} | null;
	position: InsertableCompositionElementPosition | null;
}): namedTypes.JSXAttribute => {
	return createStyleAttribute([
		...getPositionStyleProperties(position),
		...(dimensions
			? [
					recast.types.builders.objectProperty(
						recast.types.builders.identifier('width'),
						recast.types.builders.numericLiteral(dimensions.width),
					),
					recast.types.builders.objectProperty(
						recast.types.builders.identifier('height'),
						recast.types.builders.numericLiteral(dimensions.height),
					),
				]
			: []),
	]);
};

const createStaticFileSrcAttribute = ({
	staticFileLocalName,
	src,
}: {
	staticFileLocalName: string;
	src: string;
}): namedTypes.JSXAttribute => {
	return recast.types.builders.jsxAttribute(
		recast.types.builders.jsxIdentifier('src'),
		recast.types.builders.jsxExpressionContainer(
			recast.types.builders.callExpression(
				recast.types.builders.identifier(staticFileLocalName),
				[recast.types.builders.stringLiteral(src)],
			),
		),
	);
};

const createComponentProp = ({
	name,
	value,
}: ComponentProp): namedTypes.JSXAttribute => {
	if (typeof value === 'number') {
		return createNumberAttribute(name, value);
	}

	if (typeof value === 'boolean') {
		return createBooleanAttribute(name, value);
	}

	return createStringAttribute(name, value);
};

const createStringSrcAttribute = (src: string): namedTypes.JSXAttribute => {
	return recast.types.builders.jsxAttribute(
		recast.types.builders.jsxIdentifier('src'),
		recast.types.builders.stringLiteral(src),
	);
};

const createSolidElement = ({
	localName,
	width,
	height,
	position,
}: {
	localName: string;
	width: number;
	height: number;
	position: InsertableCompositionElementPosition | null;
}): namedTypes.JSXElement => {
	return recast.types.builders.jsxElement(
		recast.types.builders.jsxOpeningElement(
			recast.types.builders.jsxIdentifier(localName),
			[
				createNumberAttribute('width', width),
				createNumberAttribute('height', height),
				createStringAttribute('color', 'gray'),
				createPositionAbsoluteStyleAttribute(position),
			],
			true,
		),
		null,
		[],
	);
};

const createComponentElement = ({
	addPositionStyle,
	from,
	localName,
	props,
	position,
}: {
	addPositionStyle: boolean;
	from: number | null;
	localName: string;
	props: ComponentProp[];
	position: InsertableCompositionElementPosition | null;
}): namedTypes.JSXElement => {
	return recast.types.builders.jsxElement(
		recast.types.builders.jsxOpeningElement(
			recast.types.builders.jsxIdentifier(localName),
			[
				...props.map(createComponentProp),
				...(from === null ? [] : [createNumberAttribute('from', from)]),
				...(addPositionStyle
					? [createPositionAbsoluteStyleAttribute(position)]
					: []),
			],
			true,
		),
		null,
		[],
	);
};

const createSequenceWrappedElement = ({
	child,
	dimensions,
	durationInFrames,
	from,
	name,
	position,
	sequenceLocalName,
}: {
	child: namedTypes.JSXElement;
	dimensions: {width: number; height: number} | null;
	durationInFrames: number | null;
	from: number | null;
	name: string | null;
	position: InsertableCompositionElementPosition | null;
	sequenceLocalName: string;
}): namedTypes.JSXElement => {
	return recast.types.builders.jsxElement(
		recast.types.builders.jsxOpeningElement(
			recast.types.builders.jsxIdentifier(sequenceLocalName),
			[
				...(from === null ? [] : [createNumberAttribute('from', from)]),
				...(name === null ? [] : [createStringAttribute('name', name)]),
				...(dimensions !== null
					? [
							createNumberAttribute('width', dimensions.width),
							createNumberAttribute('height', dimensions.height),
						]
					: []),
				...(durationInFrames === null
					? []
					: [createNumberAttribute('durationInFrames', durationInFrames)]),
				createPositionAbsoluteStyleAttribute(position),
			],
			false,
		),
		recast.types.builders.jsxClosingElement(
			recast.types.builders.jsxIdentifier(sequenceLocalName),
		),
		[child],
	);
};

const createAssetElement = ({
	addPositionStyle,
	durationInFrames,
	from,
	localName,
	staticFileLocalName,
	src,
	dimensions,
	position,
}: {
	addPositionStyle: boolean;
	durationInFrames: number | null;
	from: number | null;
	localName: string;
	staticFileLocalName: string | null;
	src: string;
	dimensions: {width: number; height: number} | null;
	position: InsertableCompositionElementPosition | null;
}): namedTypes.JSXElement => {
	return recast.types.builders.jsxElement(
		recast.types.builders.jsxOpeningElement(
			recast.types.builders.jsxIdentifier(localName),
			[
				staticFileLocalName === null
					? createStringSrcAttribute(src)
					: createStaticFileSrcAttribute({staticFileLocalName, src}),
				...(durationInFrames === null
					? []
					: [createNumberAttribute('durationInFrames', durationInFrames)]),
				...(from === null ? [] : [createNumberAttribute('from', from)]),
				...(addPositionStyle
					? [createAssetStyleAttribute({dimensions, position})]
					: []),
			],
			true,
		),
		null,
		[],
	);
};

const createSvgElement = async ({
	environment,
	from,
	interactiveLocalName,
	markup,
	position,
}: {
	environment: InsertJsxElementCodemodEnvironment;
	from: number | null;
	interactiveLocalName: string;
	markup: string;
	position: InsertableCompositionElementPosition | null;
}): Promise<namedTypes.JSXElement> => {
	const svgElement = await environment.svgMarkupToJsx(markup);
	const attributes = svgElement.openingElement.attributes ?? [];
	svgElement.openingElement.attributes = attributes;
	if (from !== null) {
		attributes.push(createNumberAttribute('from', from));
	}

	const styleAttribute = attributes.find(
		(attribute) =>
			attribute.type === 'JSXAttribute' &&
			attribute.name.type === 'JSXIdentifier' &&
			attribute.name.name === 'style',
	);
	const positionProperties = getPositionStyleProperties(position);

	if (styleAttribute === undefined) {
		attributes.push(createStyleAttribute(positionProperties));
	} else if (
		styleAttribute.type === 'JSXAttribute' &&
		styleAttribute.value?.type === 'JSXExpressionContainer' &&
		styleAttribute.value.expression.type === 'ObjectExpression'
	) {
		styleAttribute.value.expression.properties.push(...positionProperties);
	} else {
		throw new Error('Could not convert the root SVG style to JSX');
	}

	const interactiveSvgName = () =>
		recast.types.builders.jsxMemberExpression(
			recast.types.builders.jsxIdentifier(interactiveLocalName),
			recast.types.builders.jsxIdentifier('Svg'),
		);
	svgElement.openingElement.name = interactiveSvgName();
	if (
		svgElement.closingElement !== null &&
		svgElement.closingElement !== undefined
	) {
		svgElement.closingElement.name = interactiveSvgName();
	}

	return svgElement;
};

const createFragmentWithElement = (element: namedTypes.JSXElement) => {
	return recast.types.builders.jsxFragment(
		recast.types.builders.jsxOpeningFragment(),
		recast.types.builders.jsxClosingFragment(),
		[element],
	);
};

const replaceNullReturnInFunctionLike = ({
	fn,
	element,
}: {
	fn: FunctionLikeNode;
	element: namedTypes.JSXElement;
}): number | null => {
	if (fn.type === 'ArrowFunctionExpression' && fn.body.type === 'NullLiteral') {
		fn.body = createFragmentWithElement(element);
		return fn.loc?.start.line ?? 1;
	}

	if (fn.body.type !== 'BlockStatement') {
		return null;
	}

	const returnStatement = getTopLevelReturnStatement(fn.body.body);
	if (
		!returnStatement?.argument ||
		returnStatement.argument.type !== 'NullLiteral'
	) {
		return null;
	}

	returnStatement.argument = createFragmentWithElement(element);
	return returnStatement.loc?.start.line ?? 1;
};

const addElementToNullComponentReturn = ({
	declaration,
	element,
}: {
	declaration: LocalComponentDeclaration | DefaultExportDeclaration;
	element: namedTypes.JSXElement;
}): number | null => {
	if (declaration.type === 'VariableDeclarator') {
		if (
			!declaration.init ||
			(declaration.init.type !== 'ArrowFunctionExpression' &&
				declaration.init.type !== 'FunctionExpression')
		) {
			return null;
		}

		return replaceNullReturnInFunctionLike({fn: declaration.init, element});
	}

	if (
		declaration.type === 'ArrowFunctionExpression' ||
		declaration.type === 'FunctionExpression' ||
		declaration.type === 'FunctionDeclaration'
	) {
		return replaceNullReturnInFunctionLike({fn: declaration, element});
	}

	if (declaration.type !== 'ClassDeclaration') {
		return null;
	}

	const renderMethod = findRenderMethod(declaration);
	if (!renderMethod) {
		return null;
	}

	const returnStatement = getTopLevelReturnStatement(renderMethod.body.body);
	if (
		!returnStatement?.argument ||
		returnStatement.argument.type !== 'NullLiteral'
	) {
		return null;
	}

	returnStatement.argument = createFragmentWithElement(element);
	return returnStatement.loc?.start.line ?? 1;
};

const declarationBindsName = (
	declaration: FunctionDeclaration | ClassDeclaration | VariableDeclaration,
	name: string,
) => {
	if (
		declaration.type === 'FunctionDeclaration' ||
		declaration.type === 'ClassDeclaration'
	) {
		return declaration.id?.name === name;
	}

	return declaration.declarations.some((variableDeclaration) => {
		return (
			variableDeclaration.id.type === 'Identifier' &&
			variableDeclaration.id.name === name
		);
	});
};

const hasTopLevelBinding = ({ast, name}: {ast: File; name: string}) => {
	return ast.program.body.some((node) => {
		if (
			node.type === 'FunctionDeclaration' ||
			node.type === 'ClassDeclaration' ||
			node.type === 'VariableDeclaration'
		) {
			return declarationBindsName(node, name);
		}

		if (
			node.type === 'ExportNamedDeclaration' &&
			node.declaration &&
			(node.declaration.type === 'FunctionDeclaration' ||
				node.declaration.type === 'ClassDeclaration' ||
				node.declaration.type === 'VariableDeclaration')
		) {
			return declarationBindsName(node.declaration, name);
		}

		if (node.type !== 'ImportDeclaration') {
			return false;
		}

		return node.specifiers?.some((specifier) => specifier.local?.name === name);
	});
};

const getAvailableSolidLocalName = (ast: File) => {
	const candidates = ['Solid', 'RemotionSolid'];
	const available = candidates.find((candidate) => {
		return !hasTopLevelBinding({ast, name: candidate});
	});

	if (!available) {
		throw new Error('Cannot add <Solid> because Solid is already defined');
	}

	return available;
};

const ensureSolidImport = (ast: File) => {
	return ensureNamedImport({
		ast,
		importedName: 'Solid',
		sourcePath: 'remotion',
		localName: getAvailableSolidLocalName(ast),
	});
};

const getAvailableSequenceLocalName = (ast: File) => {
	const candidates = ['Sequence', 'RemotionSequence'];
	const available = candidates.find((candidate) => {
		return !hasTopLevelBinding({ast, name: candidate});
	});

	if (!available) {
		throw new Error(
			'Cannot add <Sequence> because Sequence is already defined',
		);
	}

	return available;
};

const ensureSequenceImport = (ast: File) => {
	return ensureNamedImport({
		ast,
		importedName: 'Sequence',
		sourcePath: 'remotion',
		localName: getAvailableSequenceLocalName(ast),
	});
};

const ensureInteractiveImport = (ast: File) => {
	for (const statement of ast.program.body) {
		if (
			statement.type !== 'ImportDeclaration' ||
			statement.source.type !== 'StringLiteral' ||
			statement.source.value !== 'remotion'
		) {
			continue;
		}

		for (const specifier of statement.specifiers ?? []) {
			if (
				specifier.type === 'ImportSpecifier' &&
				getImportedName(specifier) === 'Interactive'
			) {
				return specifier.local?.name ?? 'Interactive';
			}
		}
	}

	const candidates = ['Interactive', 'RemotionInteractive'];
	const localName = candidates.find((candidate) => {
		return !hasTopLevelBinding({ast, name: candidate});
	});
	if (localName === undefined) {
		throw new Error(
			'Cannot add <Interactive.Svg> because Interactive is already defined',
		);
	}

	return ensureNamedImport({
		ast,
		importedName: 'Interactive',
		sourcePath: 'remotion',
		localName,
	});
};

const getImportDeclarations = ({
	ast,
	sourcePath,
}: {
	ast: File;
	sourcePath: string;
}) => {
	return ast.program.body.filter(
		(node): node is ImportDeclaration =>
			node.type === 'ImportDeclaration' &&
			node.source.type === 'StringLiteral' &&
			node.source.value === sourcePath,
	);
};

const importDeclarationHasNamespaceSpecifier = (
	importDeclaration: ImportDeclaration,
) => {
	return importDeclaration.specifiers?.some(
		(specifier) => specifier.type === 'ImportNamespaceSpecifier',
	);
};

const hasOfficialLocalImport = ({
	ast,
	importedName,
	sourcePath,
}: {
	ast: File;
	importedName: string;
	sourcePath: string;
}) => {
	return getImportDeclarations({ast, sourcePath}).some((importDeclaration) => {
		return importDeclaration.specifiers?.some((specifier) => {
			return (
				specifier.type === 'ImportSpecifier' &&
				getImportedName(specifier) === importedName &&
				(specifier.local?.name ?? importedName) === importedName
			);
		});
	});
};

const addOfficialNamedImport = ({
	ast,
	importedName,
	sourcePath,
}: {
	ast: File;
	importedName: string;
	sourcePath: string;
}) => {
	const existingImport = getImportDeclarations({ast, sourcePath}).find(
		(candidate) => !importDeclarationHasNamespaceSpecifier(candidate),
	);
	const importSpecifier = recast.types.builders.importSpecifier(
		recast.types.builders.identifier(importedName),
	) as unknown as ImportSpecifier;

	if (existingImport) {
		existingImport.specifiers = [
			...(existingImport.specifiers ?? []),
			importSpecifier,
		];
		return;
	}

	const importDeclaration = recast.types.builders.importDeclaration(
		[importSpecifier as never],
		recast.types.builders.stringLiteral(sourcePath),
	) as unknown as ImportDeclaration;
	insertImportDeclaration(ast, importDeclaration);
};

const ensureOfficialNamedImport = ({
	ast,
	importedName,
	sourcePath,
	label,
}: {
	ast: File;
	importedName: string;
	sourcePath: string;
	label: string;
}) => {
	if (hasOfficialLocalImport({ast, importedName, sourcePath})) {
		return importedName;
	}

	if (hasTopLevelBinding({ast, name: importedName})) {
		throw new Error(
			`Cannot add ${label} because ${importedName} is already defined`,
		);
	}

	addOfficialNamedImport({ast, importedName, sourcePath});
	return importedName;
};

const ensureStaticFileImport = (ast: File) => {
	return ensureOfficialNamedImport({
		ast,
		importedName: 'staticFile',
		sourcePath: 'remotion',
		label: 'staticFile()',
	});
};

const ensureCanvasImageImport = (ast: File) => {
	return ensureOfficialNamedImport({
		ast,
		importedName: 'CanvasImage',
		sourcePath: 'remotion',
		label: '<CanvasImage>',
	});
};

const ensureAnimatedImageImport = (ast: File) => {
	return ensureOfficialNamedImport({
		ast,
		importedName: 'AnimatedImage',
		sourcePath: 'remotion',
		label: '<AnimatedImage>',
	});
};

const ensureVideoImport = (ast: File) => {
	return ensureOfficialNamedImport({
		ast,
		importedName: 'Video',
		sourcePath: '@remotion/media',
		label: '<Video>',
	});
};

const ensureAudioImport = (ast: File) => {
	return ensureOfficialNamedImport({
		ast,
		importedName: 'Audio',
		sourcePath: '@remotion/media',
		label: '<Audio>',
	});
};

const ensureGifImport = (ast: File) => {
	return ensureOfficialNamedImport({
		ast,
		importedName: 'Gif',
		sourcePath: '@remotion/gif',
		label: '<Gif>',
	});
};

const hasComponentLocalImport = ({
	ast,
	importName,
	importPath,
}: {
	ast: File;
	importName: string;
	importPath: string;
}) => {
	for (const importDeclaration of getImportDeclarations({
		ast,
		sourcePath: importPath,
	})) {
		if (importDeclaration.importKind === 'type') {
			continue;
		}

		for (const specifier of importDeclaration.specifiers ?? []) {
			if (
				specifier.type === 'ImportSpecifier' &&
				specifier.importKind !== 'type' &&
				getImportedName(specifier) === importName
			) {
				return specifier.local?.name ?? importName;
			}
		}
	}

	return null;
};

const ensureComponentImport = ({
	ast,
	componentName,
	importName,
	importPath,
}: {
	ast: File;
	componentName: string;
	importName: string;
	importPath: string;
}) => {
	const existingLocalName = hasComponentLocalImport({
		ast,
		importName,
		importPath,
	});

	if (existingLocalName) {
		return existingLocalName;
	}

	if (hasTopLevelBinding({ast, name: componentName})) {
		throw new Error(
			`Cannot add <${componentName}> because ${componentName} is already defined`,
		);
	}

	return ensureNamedImport({
		ast,
		importedName: importName,
		sourcePath: importPath,
		localName: componentName,
	});
};

const identifierRegex = /^[A-Za-z_$][0-9A-Za-z_$]*$/;

const toPascalCaseIdentifier = (value: string) => {
	const words = value.match(/[a-zA-Z0-9]+/g) ?? [];
	const candidate = words
		.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
		.join('');

	if (!candidate) {
		return 'CompositionComponent';
	}

	if (/^[0-9]/.test(candidate)) {
		return `Composition${candidate}`;
	}

	return identifierRegex.test(candidate) ? candidate : 'CompositionComponent';
};

const getAvailableLocalName = ({
	ast,
	baseName,
}: {
	ast: File;
	baseName: string;
}) => {
	if (!hasTopLevelBinding({ast, name: baseName})) {
		return baseName;
	}

	const suffixed = `${baseName}Composition`;
	if (!hasTopLevelBinding({ast, name: suffixed})) {
		return suffixed;
	}

	for (let i = 2; i < 100; i++) {
		const candidate = `${suffixed}${i}`;
		if (!hasTopLevelBinding({ast, name: candidate})) {
			return candidate;
		}
	}

	throw new Error(`Cannot find a local name for ${baseName}`);
};

const getImportPathBetweenFiles = ({
	environment,
	fromFile,
	toFile,
}: {
	environment: InsertJsxElementCodemodEnvironment;
	fromFile: string;
	toFile: string;
}) => {
	let relativeImport = environment
		.relative(environment.dirname(fromFile), toFile)
		.replaceAll(environment.pathSeparator, '/')
		.replace(/\.(tsx|ts|jsx|js)$/, '');

	if (!relativeImport.startsWith('.')) {
		relativeImport = `./${relativeImport}`;
	}

	return relativeImport;
};

const ensureDefaultImport = ({
	ast,
	localName,
	sourcePath,
}: {
	ast: File;
	localName: string;
	sourcePath: string;
}) => {
	for (const declaration of getImportDeclarations({ast, sourcePath})) {
		const defaultSpecifier = declaration.specifiers?.find(
			(specifier) => specifier.type === 'ImportDefaultSpecifier',
		);
		if (defaultSpecifier?.local?.name) {
			return defaultSpecifier.local.name;
		}
	}

	const importSpecifier = recast.types.builders.importDefaultSpecifier(
		recast.types.builders.identifier(localName),
	) as unknown as ImportDefaultSpecifier;
	const existingImport = getImportDeclarations({ast, sourcePath}).find(
		(declaration) => {
			return !declaration.specifiers?.some(
				(specifier) => specifier.type === 'ImportNamespaceSpecifier',
			);
		},
	);

	if (existingImport) {
		existingImport.specifiers = [
			importSpecifier,
			...(existingImport.specifiers ?? []),
		];
		return localName;
	}

	const importDeclaration = recast.types.builders.importDeclaration(
		[importSpecifier as never],
		recast.types.builders.stringLiteral(sourcePath),
	) as unknown as ImportDeclaration;
	insertImportDeclaration(ast, importDeclaration);
	return localName;
};

const parseSerializedCompositionProps = (
	serializedResolvedPropsWithCustomSchema: string,
) => {
	const parsed: unknown = JSON.parse(serializedResolvedPropsWithCustomSchema);
	if (!isRecord(parsed)) {
		throw new Error('Resolved composition props must be an object');
	}

	return parsed;
};

const containsFileToken = (value: unknown): boolean => {
	if (typeof value === 'string') {
		return value.startsWith(NoReactInternals.FILE_TOKEN);
	}

	if (Array.isArray(value)) {
		return value.some(containsFileToken);
	}

	if (isRecord(value)) {
		return Object.values(value).some(containsFileToken);
	}

	return false;
};

const createExpressionAttribute = (
	name: string,
	value: unknown,
): namedTypes.JSXAttribute => {
	return recast.types.builders.jsxAttribute(
		recast.types.builders.jsxIdentifier(name),
		recast.types.builders.jsxExpressionContainer(
			parseValueExpression(value) as never,
		),
	) as unknown as namedTypes.JSXAttribute;
};

const createCompositionPropAttribute = ({
	name,
	value,
}: {
	name: string;
	value: unknown;
}): namedTypes.JSXAttribute => {
	if (
		typeof value === 'string' &&
		!value.startsWith(NoReactInternals.FILE_TOKEN) &&
		!value.startsWith(NoReactInternals.DATE_TOKEN)
	) {
		return createStringAttribute(name, value) as namedTypes.JSXAttribute;
	}

	return createExpressionAttribute(name, value);
};

const createCompositionObjectProperty = ({
	name,
	value,
}: {
	name: string;
	value: unknown;
}): ObjectProperty => {
	return recast.types.builders.objectProperty(
		identifierRegex.test(name)
			? recast.types.builders.identifier(name)
			: recast.types.builders.stringLiteral(name),
		parseValueExpression(value) as never,
	) as unknown as ObjectProperty;
};

const createCompositionComponentElement = ({
	localName,
	props,
}: {
	localName: string;
	props: Record<string, unknown>;
}) => {
	const directAttributes: namedTypes.JSXAttribute[] = [];
	const spreadProperties: ObjectProperty[] = [];

	for (const [name, value] of Object.entries(props)) {
		if (identifierRegex.test(name)) {
			directAttributes.push(createCompositionPropAttribute({name, value}));
		} else {
			spreadProperties.push(createCompositionObjectProperty({name, value}));
		}
	}

	const attributes: (JSXAttribute | JSXSpreadAttribute)[] = [
		...(directAttributes as unknown as JSXAttribute[]),
		...(spreadProperties.length === 0
			? []
			: [
					recast.types.builders.jsxSpreadAttribute(
						recast.types.builders.objectExpression(
							spreadProperties as never,
						) as never,
					) as unknown as JSXSpreadAttribute,
				]),
	];

	return recast.types.builders.jsxElement(
		recast.types.builders.jsxOpeningElement(
			recast.types.builders.jsxIdentifier(localName),
			attributes as never,
			true,
		),
		null,
		[],
	);
};

const getDefaultExportDeclaration = (
	ast: File,
): LocalComponentDeclaration | DefaultExportDeclaration | null => {
	let declaration: DefaultExportDeclaration | null = null;
	let identifierName: string | null = null;

	recast.types.visit(ast, {
		visitExportDefaultDeclaration(astPath) {
			if (declaration || identifierName) {
				return false;
			}

			const {node} = astPath;
			if (node.declaration.type === 'Identifier') {
				identifierName = node.declaration.name;
				return false;
			}

			declaration = node.declaration;
			return false;
		},
	});

	if (identifierName) {
		return findLocalComponentDeclaration({ast, name: identifierName});
	}

	return declaration;
};

const getDeclarationByExportName = ({
	ast,
	exportName,
}: {
	ast: File;
	exportName: string | 'default';
}): LocalComponentDeclaration | DefaultExportDeclaration | null => {
	if (exportName === 'default') {
		return getDefaultExportDeclaration(ast);
	}

	return findLocalComponentDeclaration({ast, name: exportName});
};

const addElementToComponentRoot = ({
	ast,
	exportName,
	element,
}: {
	ast: File;
	exportName: string | 'default';
	element: namedTypes.JSXElement;
}) => {
	const declaration = getDeclarationByExportName({ast, exportName});
	if (!declaration) {
		throw new Error('Could not find composition component declaration');
	}

	const rootNode = getComponentRootNode(declaration);
	if (!rootNode) {
		const insertedAt = addElementToNullComponentReturn({declaration, element});
		if (insertedAt !== null) {
			return insertedAt;
		}

		throw new Error('Composition component does not return JSX');
	}

	const CANVAS_ROOT_ELEMENTS = [
		'ThreeCanvas',
		'RiveCanvas',
		'SkiaCanvas',
		'canvas',
	];

	if (
		rootNode.type === 'JSXElement' &&
		rootNode.openingElement.name.type === 'JSXIdentifier' &&
		CANVAS_ROOT_ELEMENTS.includes(rootNode.openingElement.name.name)
	) {
		throw new Error(
			`Cannot insert a JSX element into a composition whose root element is <${rootNode.openingElement.name.name}>`,
		);
	}

	if (rootNode.type === 'JSXElement') {
		const existingRoot = rootNode.openingElement.selfClosing
			? createSequenceWithChild({
					child: stripParenthesizedExtra(rootNode),
					sequenceLocalName: ensureSequenceImport(ast),
				})
			: stripParenthesizedExtra(rootNode);
		const fragment = recast.types.builders.jsxFragment(
			recast.types.builders.jsxOpeningFragment(),
			recast.types.builders.jsxClosingFragment(),
			[existingRoot, element],
		);
		let replaced = false;
		recast.types.visit(ast, {
			visitJSXElement(astPath) {
				if (astPath.node === rootNode) {
					astPath.replace(fragment);
					replaced = true;
					return false;
				}

				this.traverse(astPath);
			},
		});

		if (!replaced) {
			throw new Error('Could not replace composition component root');
		}

		return rootNode.loc?.start.line ?? 1;
	}

	if (!rootNode.children) {
		throw new Error('Composition component root does not accept children');
	}

	rootNode.children.push(element);
	return rootNode.loc?.start.line ?? 1;
};

const getNullRootFromFunctionLike = (
	fn: FunctionLikeNode,
): NullLiteral | null => {
	if (fn.type === 'ArrowFunctionExpression' && fn.body.type === 'NullLiteral') {
		return fn.body as NullLiteral;
	}

	if (fn.body.type !== 'BlockStatement') {
		return null;
	}

	const returnStatement = getTopLevelReturnStatement(fn.body.body);
	return returnStatement?.argument?.type === 'NullLiteral'
		? (returnStatement.argument as NullLiteral)
		: null;
};

const getNullComponentRoot = (
	declaration: LocalComponentDeclaration | DefaultExportDeclaration,
): NullLiteral | null => {
	if (declaration.type === 'VariableDeclarator') {
		if (
			!declaration.init ||
			(declaration.init.type !== 'ArrowFunctionExpression' &&
				declaration.init.type !== 'FunctionExpression')
		) {
			return null;
		}

		return getNullRootFromFunctionLike(declaration.init);
	}

	if (
		declaration.type === 'ArrowFunctionExpression' ||
		declaration.type === 'FunctionExpression' ||
		declaration.type === 'FunctionDeclaration'
	) {
		return getNullRootFromFunctionLike(declaration);
	}

	if (declaration.type !== 'ClassDeclaration') {
		return null;
	}

	const renderMethod = findRenderMethod(declaration);
	if (!renderMethod) {
		return null;
	}

	const returnStatement = getTopLevelReturnStatement(renderMethod.body.body);
	return returnStatement?.argument?.type === 'NullLiteral'
		? (returnStatement.argument as NullLiteral)
		: null;
};

const getLineIndent = (input: string, offset: number) => {
	const lineStart = input.lastIndexOf('\n', offset - 1) + 1;
	return input.slice(lineStart, offset).match(/^\s*/)?.[0] ?? '';
};

const getIndentationUnit = (input: string) => {
	if (/^\t+/m.test(input)) {
		return '\t';
	}

	const indentation = input.match(/^([ ]+)\S/m)?.[1].length;
	return ' '.repeat(indentation && indentation > 1 ? indentation : 2);
};

const renderImportSpecifier = (
	specifier: NonNullable<ImportDeclaration['specifiers']>[number],
) => {
	if (specifier.type === 'ImportDefaultSpecifier') {
		return specifier.local.name;
	}

	if (specifier.type === 'ImportNamespaceSpecifier') {
		return `* as ${specifier.local.name}`;
	}

	const importedName = getImportedName(specifier);
	const localName = specifier.local?.name ?? importedName;
	const rendered =
		importedName === localName
			? importedName
			: `${importedName} as ${localName}`;
	return specifier.importKind === 'type' ? `type ${rendered}` : rendered;
};

const renderImportDeclaration = ({
	declaration,
	quote,
	semicolon,
}: {
	declaration: ImportDeclaration;
	quote: '"' | "'";
	semicolon: string;
}) => {
	const specifiers = declaration.specifiers ?? [];
	const defaultSpecifier = specifiers.find(
		(specifier) => specifier.type === 'ImportDefaultSpecifier',
	);
	const namespaceSpecifier = specifiers.find(
		(specifier) => specifier.type === 'ImportNamespaceSpecifier',
	);
	const namedSpecifiers = specifiers.filter(
		(specifier) => specifier.type === 'ImportSpecifier',
	);
	const parts = [
		...(defaultSpecifier ? [renderImportSpecifier(defaultSpecifier)] : []),
		...(namespaceSpecifier ? [renderImportSpecifier(namespaceSpecifier)] : []),
		...(namedSpecifiers.length
			? [`{${namedSpecifiers.map(renderImportSpecifier).join(', ')}}`]
			: []),
	];
	const source =
		quote === '"'
			? JSON.stringify(declaration.source.value)
			: `'${declaration.source.value.replaceAll("'", "\\'")}'`;
	return `import ${parts.join(', ')} from ${source}${semicolon}`;
};

const getInsertImportSourceEdits = ({
	ast,
	input,
	prettierConfigOverride,
	snapshots,
}: {
	ast: File;
	input: string;
	prettierConfigOverride: Record<string, unknown> | null;
	snapshots: ImportSnapshot[];
}): SourceEdit[] => {
	const edits: SourceEdit[] = [];
	const snapshotByDeclaration = new Map(
		snapshots.map((snapshot) => [snapshot.declaration, snapshot]),
	);
	const newDeclarations: ImportDeclaration[] = [];

	for (const statement of ast.program.body) {
		if (statement.type !== 'ImportDeclaration') {
			continue;
		}

		const snapshot = snapshotByDeclaration.get(statement);
		if (!snapshot) {
			newDeclarations.push(statement);
			continue;
		}

		const addedSpecifiers = (statement.specifiers ?? []).filter(
			(specifier) => !snapshot.specifiers.includes(specifier),
		);
		if (addedSpecifiers.length === 0) {
			continue;
		}

		if (
			addedSpecifiers.every(
				(specifier) => specifier.type === 'ImportDefaultSpecifier',
			) &&
			statement.loc
		) {
			const importStart = recastLocToOffset(input, statement.loc.start);
			const importPrefix = input.slice(importStart).match(/^import\s+/)?.[0];
			if (!importPrefix) {
				throw new Error('Could not locate the import prefix to update');
			}

			const offset = importStart + importPrefix.length;
			edits.push({
				end: offset,
				replacement: `${addedSpecifiers.map(renderImportSpecifier).join(', ')}, `,
				start: offset,
			});
			continue;
		}

		if (
			addedSpecifiers.some((specifier) => specifier.type !== 'ImportSpecifier')
		) {
			if (!statement.loc) {
				throw new Error('Could not locate the import to update');
			}

			const fullImportStart = recastLocToOffset(input, statement.loc.start);
			const fullImportEnd = recastLocToOffset(input, statement.loc.end);
			const fullImport = input.slice(fullImportStart, fullImportEnd);
			edits.push({
				end: fullImportEnd,
				replacement: renderImportDeclaration({
					declaration: statement,
					quote: fullImport.includes('"') ? '"' : "'",
					semicolon: fullImport.trimEnd().endsWith(';') ? ';' : '',
				}),
				start: fullImportStart,
			});
			continue;
		}

		const rendered = addedSpecifiers.map(renderImportSpecifier).join(', ');
		const lastNamedSpecifier = snapshot.specifiers.findLast(
			(specifier) => specifier.type === 'ImportSpecifier',
		);
		if (lastNamedSpecifier?.loc) {
			const offset = recastLocToOffset(input, lastNamedSpecifier.loc.end);
			edits.push({
				end: offset,
				replacement: `, ${rendered}`,
				start: offset,
			});
			continue;
		}

		const defaultSpecifier = snapshot.specifiers.find(
			(specifier) => specifier.type === 'ImportDefaultSpecifier',
		);
		if (defaultSpecifier?.loc) {
			const offset = recastLocToOffset(input, defaultSpecifier.loc.end);
			edits.push({
				end: offset,
				replacement: `, {${rendered}}`,
				start: offset,
			});
			continue;
		}

		if (!statement.loc) {
			throw new Error('Could not locate the import to update');
		}

		const start = recastLocToOffset(input, statement.loc.start);
		const end = recastLocToOffset(input, statement.loc.end);
		const original = input.slice(start, end);
		const semicolon = original.trimEnd().endsWith(';') ? ';' : '';
		edits.push({
			end,
			replacement: `import {${(statement.specifiers ?? [])
				.map(renderImportSpecifier)
				.join(', ')}} from '${statement.source.value}'${semicolon}`,
			start,
		});
	}

	if (newDeclarations.length > 0) {
		const endOfLine = input.includes('\r\n') ? '\r\n' : '\n';
		const firstImport = snapshots[0]?.declaration;
		const firstImportSource = firstImport?.source.loc
			? input.slice(
					recastLocToOffset(input, firstImport.source.loc.start),
					recastLocToOffset(input, firstImport.source.loc.end),
				)
			: null;
		const quote = firstImportSource?.startsWith('"')
			? ('"' as const)
			: firstImportSource?.startsWith("'") ||
				  prettierConfigOverride?.singleQuote === true
				? ("'" as const)
				: ('"' as const);
		const semicolon = firstImport?.loc
			? input
					.slice(
						recastLocToOffset(input, firstImport.loc.start),
						recastLocToOffset(input, firstImport.loc.end),
					)
					.trimEnd()
					.endsWith(';')
				? ';'
				: ''
			: ';';
		const rendered = newDeclarations
			.map((declaration) =>
				renderImportDeclaration({
					declaration,
					quote,
					semicolon,
				}),
			)
			.join(endOfLine);
		if (firstImport?.loc) {
			const offset = recastLocToOffset(input, firstImport.loc.start);
			edits.push({
				end: offset,
				replacement: `${rendered}${endOfLine}`,
				start: offset,
			});
		} else {
			edits.push({end: 0, replacement: `${rendered}${endOfLine}`, start: 0});
		}
	}

	return edits;
};

const indentExistingJsx = ({
	indent,
	original,
	originalIndent,
}: {
	indent: string;
	original: string;
	originalIndent: string;
}) => {
	return original
		.split(/\r?\n/)
		.map((line, index) => {
			if (index === 0) {
				return `${indent}${line}`;
			}

			return `${indent}${line.startsWith(originalIndent) ? line.slice(originalIndent.length) : line.trimStart()}`;
		})
		.join(original.includes('\r\n') ? '\r\n' : '\n');
};

const getJsxIdentifierName = (element: namedTypes.JSXElement) => {
	const {name} = element.openingElement;
	if (name.type !== 'JSXIdentifier') {
		throw new Error('Expected the inserted Solid to have an identifier name');
	}

	return name.name;
};

const getPositionStyleSource = (
	position: InsertableCompositionElementPosition | null,
	prettierConfigOverride: Record<string, unknown> | null,
) => {
	const quote = prettierConfigOverride?.singleQuote === true ? "'" : '"';
	const spacing = prettierConfigOverride?.bracketSpacing === false ? '' : ' ';
	const translate = position
		? `, translate: ${quote}${formatTranslateValue(position)}${quote}`
		: '';
	return `style={{${spacing}position: ${quote}absolute${quote}${translate}${spacing}}}`;
};

const getSolidInsertionSource = ({
	element,
	finalElement,
	height,
	input,
	position,
	prettierConfigOverride,
	sequenceWrapper,
	width,
}: {
	element: namedTypes.JSXElement;
	finalElement: namedTypes.JSXElement;
	height: number;
	input: string;
	position: InsertableCompositionElementPosition | null;
	prettierConfigOverride: Record<string, unknown> | null;
	sequenceWrapper: {
		dimensions: {width: number; height: number} | null;
		durationInFrames: number | null;
		from: number | null;
		name: string | null;
		position: InsertableCompositionElementPosition | null;
	} | null;
	width: number;
}) => {
	const endOfLine = input.includes('\r\n') ? '\r\n' : '\n';
	const unit = getIndentationUnit(input);
	const solid = [
		`<${getJsxIdentifierName(element)}`,
		`${unit}width={${width}}`,
		`${unit}height={${height}}`,
		`${unit}color="gray"`,
		`${unit}${getPositionStyleSource(position, prettierConfigOverride)}`,
		'/>',
	].join(endOfLine);
	if (finalElement === element) {
		return solid;
	}

	if (sequenceWrapper === null) {
		throw new Error('Expected insertion Sequence metadata');
	}

	const attributes = [
		...(sequenceWrapper.from === null
			? []
			: [`from={${sequenceWrapper.from}}`]),
		...(sequenceWrapper.name === null
			? []
			: [`name=${JSON.stringify(sequenceWrapper.name)}`]),
		...(sequenceWrapper.dimensions === null
			? []
			: [
					`width={${sequenceWrapper.dimensions.width}}`,
					`height={${sequenceWrapper.dimensions.height}}`,
				]),
		...(sequenceWrapper.durationInFrames === null
			? []
			: [`durationInFrames={${sequenceWrapper.durationInFrames}}`]),
		getPositionStyleSource(sequenceWrapper.position, prettierConfigOverride),
	];
	const sequenceName = getJsxIdentifierName(finalElement);
	return [
		`<${sequenceName} ${attributes.join(' ')}>`,
		...solid.split(/\r?\n/).map((line) => `${unit}${line}`),
		`</${sequenceName}>`,
	].join(endOfLine);
};

const indentInsertedJsx = ({
	indent,
	insertion,
}: {
	indent: string;
	insertion: string;
}) => {
	return insertion
		.split(/\r?\n/)
		.map((line) => `${indent}${line}`)
		.join(insertion.includes('\r\n') ? '\r\n' : '\n');
};

const printInsertedJsx = ({
	element,
	input,
	prettierConfigOverride,
}: {
	element: namedTypes.JSXElement | namedTypes.JSXFragment;
	input: string;
	prettierConfigOverride: Record<string, unknown> | null;
}): string => {
	const endOfLine = input.includes('\r\n') ? '\r\n' : '\n';
	const unit = getIndentationUnit(input);
	const printWidth = prettierConfigOverride?.printWidth;
	recast.types.visit(element, {
		visitObjectProperty(path) {
			const {node} = path;
			if (
				!node.computed &&
				node.key.type === 'StringLiteral' &&
				identifierRegex.test(node.key.value)
			) {
				node.key = recast.types.builders.identifier(node.key.value);
			}

			this.traverse(path);
			return undefined;
		},
	});
	const printNode = (node: namedTypes.Node) => {
		return recast.prettyPrint(node, {
			objectCurlySpacing: prettierConfigOverride?.bracketSpacing !== false,
			quote: prettierConfigOverride?.singleQuote === true ? 'single' : 'double',
			tabWidth: 2,
			useTabs: false,
			wrapColumn: typeof printWidth === 'number' ? printWidth : 80,
		}).code;
	};

	const normalizeIndentation = (code: string) => {
		return code
			.split('\n')
			.map((line) => {
				const spaces = line.match(/^ */)?.[0].length ?? 0;
				return `${unit.repeat(Math.floor(spaces / 2))}${line.slice(spaces)}`;
			})
			.join(endOfLine);
	};

	const printOpeningElement = (opening: namedTypes.JSXOpeningElement) => {
		const name = printNode(opening.name);
		const attributes = (opening.attributes ?? []).map((attribute) => {
			if (
				attribute.type === 'JSXAttribute' &&
				attribute.name.type === 'JSXIdentifier' &&
				attribute.value?.type === 'StringLiteral'
			) {
				return `${attribute.name.name}=${JSON.stringify(attribute.value.value)}`;
			}

			return normalizeIndentation(printNode(attribute));
		});
		const suffix = opening.selfClosing ? ' />' : '>';
		const singleLine = `<${name}${attributes.length === 0 ? '' : ` ${attributes.join(' ')}`}${suffix}`;
		if (
			!attributes.some((attribute) => attribute.includes(endOfLine)) &&
			singleLine.length <= (typeof printWidth === 'number' ? printWidth : 80)
		) {
			return singleLine;
		}

		return [
			`<${name}`,
			...attributes.map((attribute) =>
				indentInsertedJsx({indent: unit, insertion: attribute}),
			),
			opening.selfClosing ? '/>' : '>',
		].join(endOfLine);
	};

	const printElement = (
		node: namedTypes.JSXElement | namedTypes.JSXFragment,
	): string => {
		if (node.type === 'JSXFragment') {
			const fragmentChildren = (node.children ?? []).flatMap((child) => {
				if (child.type === 'JSXElement' || child.type === 'JSXFragment') {
					return [printElement(child)];
				}

				if (child.type === 'JSXText' && child.value.trim() === '') {
					return [];
				}

				return [normalizeIndentation(printNode(child))];
			});
			return [
				'<>',
				...fragmentChildren.map((child) =>
					indentInsertedJsx({indent: unit, insertion: child}),
				),
				'</>',
			].join(endOfLine);
		}

		const opening = printOpeningElement(node.openingElement);
		if (node.openingElement.selfClosing) {
			return opening;
		}

		const closing = node.closingElement
			? normalizeIndentation(printNode(node.closingElement))
			: '';
		const children = node.children ?? [];
		if (
			children.length === 1 &&
			children[0].type === 'JSXText' &&
			!children[0].value.includes('\n')
		) {
			return `${opening}${children[0].value}${closing}`;
		}

		const printedChildren = children.flatMap((child) => {
			if (child.type === 'JSXElement' || child.type === 'JSXFragment') {
				return [printElement(child)];
			}

			if (child.type === 'JSXText' && child.value.trim() === '') {
				return [];
			}

			return [normalizeIndentation(printNode(child))];
		});
		if (printedChildren.length === 0) {
			return `${opening}${closing}`;
		}

		return [
			opening,
			...printedChildren.map((child) =>
				indentInsertedJsx({indent: unit, insertion: child}),
			),
			closing,
		].join(endOfLine);
	};

	return printElement(element);
};

const getInsertionSource = ({
	element,
	elementToInsert,
	finalElementToInsert,
	input,
	prettierConfigOverride,
	sequenceWrapper,
}: {
	element: InsertableCompositionElement;
	elementToInsert: namedTypes.JSXElement;
	finalElementToInsert: namedTypes.JSXElement;
	input: string;
	prettierConfigOverride: Record<string, unknown> | null;
	sequenceWrapper: {
		dimensions: {width: number; height: number} | null;
		durationInFrames: number | null;
		from: number | null;
		name: string | null;
		position: InsertableCompositionElementPosition | null;
	} | null;
}) => {
	if (element.type === 'solid') {
		return getSolidInsertionSource({
			element: elementToInsert,
			finalElement: finalElementToInsert,
			height: element.height,
			input,
			position: element.position,
			prettierConfigOverride,
			sequenceWrapper,
			width: element.width,
		});
	}

	return printInsertedJsx({
		element: finalElementToInsert,
		input,
		prettierConfigOverride,
	});
};

const getInsertionRootSourceEdit = ({
	input,
	insertion,
	nullRoot,
	root,
	sequenceLocalName,
}: {
	input: string;
	insertion: string;
	nullRoot: NullLiteral | null;
	root: namedTypes.JSXElement | namedTypes.JSXFragment | null;
	sequenceLocalName: string | null;
}): SourceEdit => {
	const endOfLine = input.includes('\r\n') ? '\r\n' : '\n';
	const unit = getIndentationUnit(input);

	if (nullRoot) {
		if (!nullRoot.loc) {
			throw new Error('Could not locate the null component root');
		}

		const nullStart = recastLocToOffset(input, nullRoot.loc.start);
		const nullEnd = recastLocToOffset(input, nullRoot.loc.end);
		const nullIndent = getLineIndent(input, nullStart);
		return {
			end: nullEnd,
			replacement: [
				'(',
				`${nullIndent}${unit}<>`,
				indentInsertedJsx({
					indent: `${nullIndent}${unit}${unit}`,
					insertion,
				}),
				`${nullIndent}${unit}</>`,
				`${nullIndent})`,
			].join(endOfLine),
			start: nullStart,
		};
	}

	if (!root?.loc) {
		throw new Error('Could not locate the composition component root');
	}

	if (root.type === 'JSXFragment') {
		if (!root.closingFragment.loc) {
			throw new Error('Could not locate the composition fragment closing tag');
		}

		const closingStart = recastLocToOffset(
			input,
			root.closingFragment.loc.start,
		);
		const lineStart = input.lastIndexOf('\n', closingStart - 1) + 1;
		const beforeClosing = input.slice(lineStart, closingStart);
		const closingIndent = /^\s*$/.test(beforeClosing)
			? beforeClosing
			: getLineIndent(input, recastLocToOffset(input, root.loc.start));
		if (/^\s*$/.test(beforeClosing) && lineStart > 0) {
			return {
				end: closingStart,
				replacement: `${indentInsertedJsx({
					indent: `${closingIndent}${unit}`,
					insertion,
				})}${endOfLine}${closingIndent}`,
				start: lineStart,
			};
		}

		return {
			end: closingStart,
			replacement: `${endOfLine}${indentInsertedJsx({
				indent: `${closingIndent}${unit}`,
				insertion,
			})}${endOfLine}${closingIndent}`,
			start: closingStart,
		};
	}

	const start = recastLocToOffset(input, root.loc.start);
	const end = recastLocToOffset(input, root.loc.end);
	const indent = getLineIndent(input, start);
	const original = input.slice(start, end);
	const existingRoot = root.openingElement.selfClosing
		? [
				`${indent}${unit}<${sequenceLocalName}>`,
				indentExistingJsx({
					indent: `${indent}${unit}${unit}`,
					original,
					originalIndent: indent,
				}),
				`${indent}${unit}</${sequenceLocalName}>`,
			]
		: [
				indentExistingJsx({
					indent: `${indent}${unit}`,
					original,
					originalIndent: indent,
				}),
			];

	if (root.openingElement.selfClosing && sequenceLocalName === null) {
		throw new Error('Expected a Sequence import for a self-closing root');
	}

	return {
		end,
		replacement: [
			'<>',
			...existingRoot,
			indentInsertedJsx({indent: `${indent}${unit}`, insertion}),
			`${indent}</>`,
		].join(endOfLine),
		start,
	};
};

const applySourceEdits = ({
	edits,
	input,
}: {
	edits: SourceEdit[];
	input: string;
}) => {
	const sorted = edits.slice().sort((left, right) => right.start - left.start);
	let output = input;
	let previousStart = input.length + 1;
	for (const edit of sorted) {
		if (edit.end > previousStart) {
			throw new Error('Overlapping JSX insertion source ranges');
		}

		output =
			output.slice(0, edit.start) + edit.replacement + output.slice(edit.end);
		previousStart = edit.start;
	}

	return output;
};

const canAddSequenceToComponent = ({
	ast,
	exportName,
}: {
	ast: File;
	exportName: string | 'default';
}): boolean => {
	try {
		addElementToComponentRoot({
			ast,
			exportName,
			element: createSequenceElement(),
		});
		recast.print(ast);
		return true;
	} catch {
		return false;
	}
};

const getComponentLocationInFile = async ({
	environment,
	fileName,
	exportName,
	ast: providedAst,
}: {
	environment: InsertJsxElementCodemodEnvironment;
	fileName: string;
	exportName: string | 'default';
	ast?: File;
}): Promise<ResolvedCompositionComponentWithFile> => {
	const ast =
		providedAst ?? parseAst(await readSourceFile({environment, fileName}));
	const location =
		exportName === 'default'
			? findDefaultExportLocation(ast)
			: findLocalSymbolLocation({ast, name: exportName});
	const canAddSequence = canAddSequenceToComponent({
		ast,
		exportName,
	});

	return {
		source: environment.relative(environment.rootDir, fileName),
		fileName,
		exportName,
		line: location?.line ?? 1,
		column: location?.column ?? 0,
		canAddSequence,
	};
};

const getComponentLocationRecursively = async ({
	environment,
	fileName,
	exportName,
	visited,
}: {
	environment: InsertJsxElementCodemodEnvironment;
	fileName: string;
	exportName: string | 'default';
	visited: Set<string>;
}): Promise<ResolvedCompositionComponentWithFile> => {
	const key = `${fileName}:${exportName}`;
	if (visited.has(key)) {
		throw new Error(
			`Could not resolve component export "${exportName}" in ${environment.relative(environment.rootDir, fileName)}`,
		);
	}

	visited.add(key);
	try {
		const input = await readSourceFile({environment, fileName});
		const ast = parseAst(input);
		const localDeclaration = getDeclarationByExportName({
			ast,
			exportName,
		});
		if (localDeclaration) {
			return await getComponentLocationInFile({
				environment,
				fileName,
				exportName,
				ast,
			});
		}

		const reExportTargets = findReExportTargets({
			ast,
			exportName,
		});
		for (const target of reExportTargets) {
			try {
				const resolvedImportPath = resolveImportPath({
					environment,
					importPath: target.importPath,
					fromFile: fileName,
				});

				return await getComponentLocationRecursively({
					environment,
					fileName: resolvedImportPath,
					exportName: target.exportName,
					visited,
				});
			} catch {
				continue;
			}
		}

		if (reExportTargets.length > 0) {
			throw new Error(
				`Could not resolve component export "${exportName}" in ${environment.relative(environment.rootDir, fileName)}`,
			);
		}

		return await getComponentLocationInFile({
			environment,
			fileName,
			exportName,
			ast,
		});
	} finally {
		visited.delete(key);
	}
};

export async function resolveCompositionComponentWithFile({
	environment,
	compositionFile,
	compositionId,
}: {
	environment: InsertJsxElementCodemodEnvironment;
	compositionFile: string;
	compositionId: string;
}): Promise<ResolvedCompositionComponentWithFile> {
	const compositionFileName = environment.resolve(
		environment.rootDir,
		compositionFile,
	);
	const input = await readSourceFile({
		environment,
		fileName: compositionFileName,
	});
	const ast = parseAstForReadOnly(input);
	const compositionElement = findCompositionElement({ast, compositionId});
	if (!compositionElement) {
		throw new Error(`Could not find composition "${compositionId}"`);
	}

	const lazyImportPath = getLazyImportPath(compositionElement);
	if (lazyImportPath) {
		const lazyComponentFile = resolveImportPath({
			environment,
			importPath: lazyImportPath,
			fromFile: compositionFileName,
		});
		return getComponentLocationRecursively({
			environment,
			fileName: lazyComponentFile,
			exportName: 'default',
			visited: new Set(),
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
			environment,
			fileName: compositionFileName,
			exportName: componentName,
		});
	}

	const importedComponentFile = resolveImportPath({
		environment,
		importPath: importTarget.importPath,
		fromFile: compositionFileName,
	});

	return getComponentLocationRecursively({
		environment,
		fileName: importedComponentFile,
		exportName: importTarget.exportName,
		visited: new Set(),
	});
}

export const resolveCompositionComponent = async ({
	environment,
	compositionFile,
	compositionId,
}: {
	environment: InsertJsxElementCodemodEnvironment;
	compositionFile: string;
	compositionId: string;
}): Promise<ResolvedCompositionComponent> => {
	const {source, line, column, canAddSequence} =
		await resolveCompositionComponentWithFile({
			environment,
			compositionFile,
			compositionId,
		});

	return {
		source,
		line,
		column,
		canAddSequence,
	};
};

const ensureCompositionComponentImport = async ({
	ast,
	compositionFile,
	compositionId,
	destinationFileName,
	environment,
}: {
	ast: File;
	compositionFile: string;
	compositionId: string;
	destinationFileName: string;
	environment: InsertJsxElementCodemodEnvironment;
}) => {
	const sourceLocation = await resolveCompositionComponentWithFile({
		environment,
		compositionFile,
		compositionId,
	});

	if (sourceLocation.fileName === destinationFileName) {
		if (sourceLocation.exportName === 'default') {
			throw new Error(
				'Cannot insert a composition whose component is a default export in the same file',
			);
		}

		if (!hasTopLevelBinding({ast, name: sourceLocation.exportName})) {
			throw new Error(
				`Cannot find component "${sourceLocation.exportName}" in this file`,
			);
		}

		return sourceLocation.exportName;
	}

	if (sourceLocation.exportName !== 'default') {
		const sourceAst = parseAstForReadOnly(
			await readSourceFile({
				environment,
				fileName: sourceLocation.fileName,
			}),
		);
		const hasNamedExport = sourceAst.program.body.some((node) => {
			if (
				node.type !== 'ExportNamedDeclaration' ||
				node.exportKind === 'type'
			) {
				return false;
			}

			if (
				node.declaration &&
				(node.declaration.type === 'FunctionDeclaration' ||
					node.declaration.type === 'ClassDeclaration' ||
					node.declaration.type === 'VariableDeclaration') &&
				declarationBindsName(node.declaration, sourceLocation.exportName)
			) {
				return true;
			}

			return node.specifiers.some((specifier) => {
				return (
					specifier.type === 'ExportSpecifier' &&
					specifier.exportKind !== 'type' &&
					getSpecifierLocalName(specifier) === sourceLocation.exportName &&
					getExportedName(specifier.exported) === sourceLocation.exportName
				);
			});
		});

		if (!hasNamedExport) {
			throw new Error(
				`Cannot add composition "${compositionId}" because its component "${sourceLocation.exportName}" is not exported from ${sourceLocation.source}. Export the component and try again.`,
			);
		}
	}

	const sourcePath = getImportPathBetweenFiles({
		environment,
		fromFile: destinationFileName,
		toFile: sourceLocation.fileName,
	});

	if (sourceLocation.exportName === 'default') {
		return ensureDefaultImport({
			ast,
			localName: getAvailableLocalName({
				ast,
				baseName: toPascalCaseIdentifier(compositionId),
			}),
			sourcePath,
		});
	}

	return ensureNamedImport({
		ast,
		importedName: sourceLocation.exportName,
		sourcePath,
		localName: getAvailableLocalName({
			ast,
			baseName: sourceLocation.exportName,
		}),
	});
};

const createInsertableJsxElement = ({
	addPositionStyleToComponent,
	ast,
	destinationFileName,
	element,
	environment,
	from,
}: {
	addPositionStyleToComponent: boolean;
	ast: File;
	destinationFileName: string;
	element: InsertableCompositionElement;
	environment: InsertJsxElementCodemodEnvironment;
	from: number | null;
}): Promise<namedTypes.JSXElement> | namedTypes.JSXElement => {
	if (element.type === 'solid') {
		const solidLocalName = ensureSolidImport(ast);

		return createSolidElement({
			localName: solidLocalName,
			width: element.width,
			height: element.height,
			position: element.position,
		});
	}

	if (element.type === 'component') {
		const componentLocalName = ensureComponentImport({
			ast,
			componentName: element.componentName,
			importName: element.importName,
			importPath: element.importPath,
		});

		return createComponentElement({
			addPositionStyle: addPositionStyleToComponent,
			from,
			localName: componentLocalName,
			props: element.props,
			position: element.position,
		});
	}

	if (element.type === 'svg') {
		return createSvgElement({
			environment,
			from,
			interactiveLocalName: ensureInteractiveImport(ast),
			markup: element.markup,
			position: element.position,
		});
	}

	if (element.type === 'composition') {
		return Promise.resolve(
			ensureCompositionComponentImport({
				ast,
				compositionFile: element.compositionFile,
				compositionId: element.compositionId,
				destinationFileName,
				environment,
			}),
		).then((localName) => {
			const props = parseSerializedCompositionProps(
				element.serializedResolvedPropsWithCustomSchema,
			);
			if (containsFileToken(props)) {
				ensureStaticFileImport(ast);
			}

			return createCompositionComponentElement({localName, props});
		});
	}

	if (element.type === 'asset') {
		if (element.srcType === 'remote' && !isUrl(element.src)) {
			throw new Error('Remote asset source must be a URL');
		}

		const staticFileLocalName =
			element.srcType === 'remote' ? null : ensureStaticFileImport(ast);
		let localName: string;
		if (element.assetType === 'image') {
			localName = ensureCanvasImageImport(ast);
		} else if (element.assetType === 'video') {
			localName = ensureVideoImport(ast);
		} else if (element.assetType === 'gif') {
			localName = ensureGifImport(ast);
		} else if (element.assetType === 'animated-image') {
			localName = ensureAnimatedImageImport(ast);
		} else if (element.assetType === 'audio') {
			localName = ensureAudioImport(ast);
		} else {
			throw new Error('Unsupported asset type');
		}

		return createAssetElement({
			addPositionStyle:
				addPositionStyleToComponent && element.assetType !== 'audio',
			durationInFrames:
				element.assetType === 'image' ? null : element.durationInFrames,
			from,
			localName,
			staticFileLocalName,
			src: element.src,
			dimensions:
				element.assetType === 'image' && from !== null
					? null
					: element.dimensions,
			position: element.position,
		});
	}

	throw new Error('Unsupported element type');
};

export const insertJsxElementIntoComposition = async ({
	compositionFile,
	compositionId,
	element,
	environment,
	from,
	prettierConfigOverride,
	wrapInSequence,
}: {
	compositionFile: string;
	compositionId: string;
	element: InsertableCompositionElement;
	environment: InsertJsxElementCodemodEnvironment;
	from: number | null;
	prettierConfigOverride: Record<string, unknown> | null;
	wrapInSequence: {
		dimensions: {width: number; height: number} | null;
		durationInFrames: number | null;
		from: number | null;
		name: string | null;
		position: InsertableCompositionElementPosition | null;
	} | null;
}): Promise<{
	fileName: string;
	source: string;
	oldContents: string;
	output: string;
	formatted: boolean;
	logLine: number;
	nodePathRemappings: SequenceNodePathRemapping[];
	insertedNodePath: SequenceNodePath | null;
}> => {
	if (
		from !== null &&
		(!Number.isInteger(from) || !Number.isFinite(from) || from < 0)
	) {
		throw new Error('from must be a non-negative integer');
	}

	if (
		element.position !== null &&
		(!Number.isFinite(element.position.x) ||
			!Number.isFinite(element.position.y))
	) {
		throw new Error('Position must be finite');
	}

	const location = await resolveCompositionComponentWithFile({
		environment,
		compositionFile,
		compositionId,
	});
	if (!location.canAddSequence) {
		throw new Error(
			'Cannot insert JSX element into this composition component',
		);
	}

	const input = await readSourceFile({
		environment,
		fileName: location.fileName,
	});
	const ast = parseAst(input);
	const capturedNodePaths = captureJsxNodePaths(ast);
	const componentDeclaration = getDeclarationByExportName({
		ast,
		exportName: location.exportName,
	});
	const rootBeforeInsertion = componentDeclaration
		? getComponentRootNode(componentDeclaration)
		: null;
	const nullRootBeforeInsertion = componentDeclaration
		? getNullComponentRoot(componentDeclaration)
		: null;
	const importSnapshots: ImportSnapshot[] = ast.program.body.flatMap(
		(statement) =>
			statement.type === 'ImportDeclaration'
				? [
						{
							declaration: statement,
							specifiers: [...(statement.specifiers ?? [])],
						},
					]
				: [],
	);
	if (
		element.type === 'composition' &&
		element.compositionId === compositionId
	) {
		throw new Error('Cannot insert a composition into itself');
	}

	const sequenceWrapper =
		element.type === 'composition'
			? {
					dimensions: {width: element.width, height: element.height},
					durationInFrames: element.durationInFrames,
					name: element.compositionId,
					position: element.position,
					from,
				}
			: from === null ||
				  element.type === 'asset' ||
				  element.type === 'svg' ||
				  element.type === 'component'
				? wrapInSequence
				: {
						dimensions: null,
						durationInFrames: null,
						name: null,
						position: element.position,
						from,
					};
	const elementToInsert = await createInsertableJsxElement({
		addPositionStyleToComponent: sequenceWrapper === null,
		ast,
		destinationFileName: location.fileName,
		element,
		environment,
		from,
	});
	const finalElementToInsert = sequenceWrapper
		? createSequenceWrappedElement({
				child: elementToInsert,
				dimensions: sequenceWrapper.dimensions,
				durationInFrames: sequenceWrapper.durationInFrames ?? null,
				from: sequenceWrapper.from,
				name: sequenceWrapper.name,
				position: sequenceWrapper.position,
				sequenceLocalName: ensureSequenceImport(ast),
			})
		: elementToInsert;
	const logLine = addElementToComponentRoot({
		ast,
		exportName: location.exportName,
		element: finalElementToInsert,
	});
	const finalRoot = componentDeclaration
		? getComponentRootNode(componentDeclaration)
		: null;
	const firstFinalRootChild =
		finalRoot?.type === 'JSXFragment'
			? (finalRoot.children?.[0] ?? null)
			: null;
	const sequenceLocalName =
		rootBeforeInsertion?.type === 'JSXElement' &&
		rootBeforeInsertion.openingElement.selfClosing &&
		firstFinalRootChild?.type === 'JSXElement' &&
		firstFinalRootChild.openingElement.name.type === 'JSXIdentifier'
			? firstFinalRootChild.openingElement.name.name
			: null;
	const output = applySourceEdits({
		edits: [
			...getInsertImportSourceEdits({
				ast,
				input,
				prettierConfigOverride,
				snapshots: importSnapshots,
			}),
			getInsertionRootSourceEdit({
				input,
				insertion: getInsertionSource({
					element,
					elementToInsert,
					finalElementToInsert,
					input,
					prettierConfigOverride,
					sequenceWrapper,
				}),
				nullRoot: nullRootBeforeInsertion,
				root: rootBeforeInsertion,
				sequenceLocalName,
			}),
		],
		input,
	});
	const formatted = true;

	const {finalNodePathByNode, nodePathRemappings} = getNodePathRemappings({
		ast,
		captured: capturedNodePaths,
		output,
	});
	const insertedNodePath =
		finalNodePathByNode.get(
			finalElementToInsert.openingElement as JSXOpeningElement,
		) ?? null;

	return {
		fileName: location.fileName,
		source: location.source,
		oldContents: input,
		output,
		formatted,
		insertedNodePath,
		logLine,
		nodePathRemappings,
	};
};

export const insertJsxElementIntoProjectWithNodePathRemappings = async <
	Project extends {files: Record<string, string>; rootDir: string},
>({
	project,
	request,
	formatFile,
	svgMarkupToJsx,
	wrapInSequence,
}: {
	project: Project;
	request: InsertJsxElementRequest;
	formatFile: InsertJsxElementCodemodEnvironment['formatFile'];
	svgMarkupToJsx: InsertJsxElementCodemodEnvironment['svgMarkupToJsx'];
	wrapInSequence: {
		dimensions: {width: number; height: number} | null;
		durationInFrames: number | null;
		from: number | null;
		name: string | null;
		position: InsertableCompositionElementPosition | null;
	} | null;
}): Promise<{
	filePath: string;
	insertedNodePath: SequenceNodePath | null;
	nodePathRemappings: SequenceNodePathRemapping[];
	project: Project;
}> => {
	const result = await insertJsxElementIntoComposition({
		compositionFile: request.compositionFile,
		compositionId: request.compositionId,
		element: request.element,
		environment: makeInMemoryInsertJsxElementCodemodEnvironment({
			formatFile,
			project,
			svgMarkupToJsx,
		}),
		from: request.from,
		prettierConfigOverride: null,
		wrapInSequence,
	});

	return {
		filePath: result.fileName,
		insertedNodePath: result.insertedNodePath,
		nodePathRemappings: result.nodePathRemappings,
		project: {
			...project,
			files: {...project.files, [result.fileName]: result.output},
		},
	};
};
