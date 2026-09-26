import type {
	ExportAllDeclaration,
	ExportNamedDeclaration,
	ExportSpecifier,
	File,
	ImportDeclaration,
	ImportDefaultSpecifier,
	JSXAttribute,
	JSXElement,
	JSXOpeningElement,
	JSXSpreadAttribute,
	NullLiteral,
	ObjectProperty,
} from '@babel/types';
import type {
	InsertJsxElementRequest,
	InsertableCompositionElement,
	InsertableCompositionElementPosition,
	SequenceNodePathRemapping,
} from '@remotion/studio-shared';
import type {namedTypes} from 'ast-types';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {indentInsertedJsx, printInsertedJsx} from './print-jsx';
import {recastLocToOffset} from './recast-loc-to-offset';
import {
	declarationBindsName,
	ensureNamedImport,
	ensureStaticFileBinding,
	getImportDeclarations,
	getImportedName,
	hasTopLevelBinding,
	insertImportDeclaration,
} from './sequence-props/imports';
import {parseAst, parseAstForReadOnly} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getInsertImportSourceEdits,
	type SourceEdit,
} from './source-edits';
import {getEndOfLine, getIndentationUnit, getLineIndent} from './source-style';
import {stripParenthesizedExtra} from './strip-parenthesized-extra';
import {parseValueExpression} from './update-nested-prop';

export type InsertJsxElementCodemodEnvironment = {
	rootDir: string;
	dirname: (fileName: string) => string;
	extname: (fileName: string) => string;
	fileExists: (fileName: string) => boolean;
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
	project,
	svgMarkupToJsx,
}: {
	project: {files: Record<string, string>; rootDir: string};
	svgMarkupToJsx: InsertJsxElementCodemodEnvironment['svgMarkupToJsx'];
}): InsertJsxElementCodemodEnvironment => {
	const filesByNormalizedPath = new Map(
		Object.entries(project.files).map(([fileName, contents]) => [
			resolveVirtualPath(project.rootDir, fileName),
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

export type LocalComponentDeclaration =
	| namedTypes.VariableDeclarator
	| namedTypes.FunctionDeclaration
	| namedTypes.ClassDeclaration;

type FunctionLikeNode =
	| namedTypes.ArrowFunctionExpression
	| namedTypes.FunctionExpression
	| namedTypes.FunctionDeclaration;

export type DefaultExportDeclaration =
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

export const getComponentRootNode = (
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

const translateDecimalPlaces = 1;

const roundTranslateCoordinate = (value: number): number => {
	const factor = 10 ** translateDecimalPlaces;
	const rounded = Math.round(value * factor) / factor;
	return Object.is(rounded, -0) ? 0 : rounded;
};

export const formatTranslateValue = ({
	x,
	y,
}: InsertableCompositionElementPosition) =>
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

export const getDeclarationByExportName = ({
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

export const addElementToComponentRoot = ({
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
		const existingRoot = stripParenthesizedExtra(rootNode);
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

export const getNullComponentRoot = (
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
		.join(getEndOfLine(original));
};

export const getInsertionRootSourceEdit = ({
	insertInside,
	input,
	insertion,
	nullRoot,
	prettierConfigOverride,
	root,
}: {
	insertInside: boolean;
	input: string;
	insertion: string;
	nullRoot: NullLiteral | null;
	prettierConfigOverride: Record<string, unknown> | null;
	root: namedTypes.JSXElement | namedTypes.JSXFragment | null;
}): SourceEdit => {
	const endOfLine = getEndOfLine(input);
	const unit = getIndentationUnit(input, prettierConfigOverride);

	if (nullRoot) {
		if (!nullRoot.loc) {
			throw new Error('Could not locate the null component root');
		}

		const nullStart = recastLocToOffset(input, nullRoot.loc.start);
		const nullEnd = recastLocToOffset(input, nullRoot.loc.end);
		const nullIndent = getLineIndent({input, offset: nullStart});
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

	if (insertInside) {
		const closing =
			root.type === 'JSXFragment' ? root.closingFragment : root.closingElement;
		if (!closing?.loc) {
			if (root.type !== 'JSXElement' || !root.openingElement.loc) {
				throw new Error('Could not locate the composition closing tag');
			}

			const openingStart = recastLocToOffset(
				input,
				root.openingElement.loc.start,
			);
			const openingEnd = recastLocToOffset(input, root.openingElement.loc.end);
			const openingIndent = getLineIndent({input, offset: openingStart});
			return {
				start: openingStart,
				end: openingEnd,
				replacement: [
					// Keep a `>` that closed the tag on its own line where it was.
					input
						.slice(openingStart, openingEnd)
						.replace(/(\s*)\/>$/, (_, whitespace: string) =>
							whitespace.includes('\n') ? `${whitespace}>` : '>',
						),
					indentInsertedJsx({indent: `${openingIndent}${unit}`, insertion}),
					`${openingIndent}</${recast.print(root.openingElement.name).code}>`,
				].join(endOfLine),
			};
		}

		const closingStart = recastLocToOffset(input, closing.loc.start);
		const lineStart = input.lastIndexOf('\n', closingStart - 1) + 1;
		const beforeClosing = input.slice(lineStart, closingStart);
		const closingIndent = /^\s*$/.test(beforeClosing)
			? beforeClosing
			: getLineIndent({
					input,
					offset: recastLocToOffset(input, root.loc.start),
				});
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
	const indent = getLineIndent({input, offset: start});
	const original = input.slice(start, end);
	const existingRoot = indentExistingJsx({
		indent: `${indent}${unit}`,
		original,
		originalIndent: indent,
	});

	return {
		end,
		replacement: [
			'<>',
			existingRoot,
			indentInsertedJsx({indent: `${indent}${unit}`, insertion}),
			`${indent}</>`,
		].join(endOfLine),
		start,
	};
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

// Elements that cannot be described with `createElement()`: SVG markup needs
// an SVG-to-JSX conversion, and compositions need their component resolved
// and imported from another project file.
export type PipelineInsertableElement = Extract<
	InsertableCompositionElement,
	{type: 'svg' | 'composition'}
>;

const createInsertableJsxElement = ({
	ast,
	destinationFileName,
	element,
	environment,
	from,
}: {
	ast: File;
	destinationFileName: string;
	element: PipelineInsertableElement;
	environment: InsertJsxElementCodemodEnvironment;
	from: number | null;
}): Promise<namedTypes.JSXElement> => {
	if (element.type === 'svg') {
		return createSvgElement({
			environment,
			from,
			interactiveLocalName: ensureInteractiveImport(ast),
			markup: element.markup,
			position: element.position,
		});
	}

	return ensureCompositionComponentImport({
		ast,
		compositionFile: element.compositionFile,
		compositionId: element.compositionId,
		destinationFileName,
		environment,
	}).then((localName) => {
		const props = parseSerializedCompositionProps(
			element.serializedResolvedPropsWithCustomSchema,
		);
		if (containsFileToken(props)) {
			ensureStaticFileBinding(ast);
		}

		return createCompositionComponentElement({localName, props});
	});
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
	logLine: number;
	nodePathRemappings: SequenceNodePathRemapping[];
	insertedNodePath: SequenceNodePath | null;
}> => {
	if (element.type !== 'svg' && element.type !== 'composition') {
		throw new Error(
			`Insert ${element.type} elements with addElement() and createElementFromInsertable()`,
		);
	}

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
	const importSnapshots = captureImportSnapshots(ast);
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
			: wrapInSequence;
	const elementToInsert = await createInsertableJsxElement({
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
	const output = applySourceEdits({
		edits: [
			...getInsertImportSourceEdits({
				ast,
				input,
				prettierConfigOverride,
				snapshots: importSnapshots,
			}),
			getInsertionRootSourceEdit({
				insertInside: rootBeforeInsertion?.type === 'JSXFragment',
				input,
				insertion: printInsertedJsx({
					compactLiteralProps: true,
					element: finalElementToInsert,
					input,
					prettierConfigOverride,
				}),
				nullRoot: nullRootBeforeInsertion,
				prettierConfigOverride,
				root: rootBeforeInsertion,
			}),
		],
		input,
	});
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
		insertedNodePath,
		logLine,
		nodePathRemappings,
	};
};

export const insertJsxElementIntoProjectWithNodePathRemappings = async ({
	project,
	request,
	svgMarkupToJsx,
	wrapInSequence,
}: {
	project: {files: Record<string, string>; rootDir: string};
	request: InsertJsxElementRequest;
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
	output: string;
}> => {
	const result = await insertJsxElementIntoComposition({
		compositionFile: request.compositionFile,
		compositionId: request.compositionId,
		element: request.element,
		environment: makeInMemoryInsertJsxElementCodemodEnvironment({
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
		output: result.output,
	};
};
