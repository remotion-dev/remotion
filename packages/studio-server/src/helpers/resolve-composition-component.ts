import fs from 'node:fs';
import path from 'node:path';
import type {
	ClassDeclaration,
	ExportAllDeclaration,
	ExportNamedDeclaration,
	ExportSpecifier,
	File,
	FunctionDeclaration,
	ImportDefaultSpecifier,
	ImportDeclaration,
	ImportSpecifier,
	JSXAttribute,
	JSXElement,
	JSXSpreadAttribute,
	ObjectProperty,
	VariableDeclaration,
} from '@babel/types';
import {
	isUrl,
	type ComponentProp,
	type InsertableCompositionElement,
	type InsertableCompositionElementPosition,
} from '@remotion/studio-shared';
import type {namedTypes} from 'ast-types';
import * as recast from 'recast';
import {NoReactInternals} from 'remotion/no-react';
import {formatFileContent} from '../codemods/format-file-content';
import {parseAst, serializeAst} from '../codemods/parse-ast';
import {stripParenthesizedExtra} from '../codemods/strip-parenthesized-extra';
import {parseValueExpression} from '../codemods/update-nested-prop';
import {
	ensureNamedImport,
	getImportedName,
	insertImportDeclaration,
} from './imports';
import {svgMarkupToJsx} from './svg-to-jsx';

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
			if (typeof node.source?.value !== 'string') {
				return false;
			}

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
	localName,
	props,
	position,
}: {
	addPositionStyle: boolean;
	localName: string;
	props: ComponentProp[];
	position: InsertableCompositionElementPosition | null;
}): namedTypes.JSXElement => {
	return recast.types.builders.jsxElement(
		recast.types.builders.jsxOpeningElement(
			recast.types.builders.jsxIdentifier(localName),
			[
				...props.map(createComponentProp),
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
	name,
	position,
	sequenceLocalName,
}: {
	child: namedTypes.JSXElement;
	dimensions: {width: number; height: number} | null;
	durationInFrames: number | null;
	name: string | null;
	position: InsertableCompositionElementPosition | null;
	sequenceLocalName: string;
}): namedTypes.JSXElement => {
	return recast.types.builders.jsxElement(
		recast.types.builders.jsxOpeningElement(
			recast.types.builders.jsxIdentifier(sequenceLocalName),
			[
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
	localName,
	staticFileLocalName,
	src,
	dimensions,
	position,
}: {
	addPositionStyle: boolean;
	durationInFrames: number | null;
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
	interactiveLocalName,
	markup,
	position,
}: {
	interactiveLocalName: string;
	markup: string;
	position: InsertableCompositionElementPosition | null;
}): Promise<namedTypes.JSXElement> => {
	const svgElement = await svgMarkupToJsx(markup);
	const attributes = svgElement.openingElement.attributes ?? [];
	svgElement.openingElement.attributes = attributes;
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
		for (const specifier of importDeclaration.specifiers ?? []) {
			if (
				specifier.type === 'ImportSpecifier' &&
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
	fromFile,
	toFile,
}: {
	fromFile: string;
	toFile: string;
}) => {
	let relativeImport = path
		.relative(path.dirname(fromFile), toFile)
		.replaceAll(path.sep, '/')
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

const ensureCompositionComponentImport = async ({
	ast,
	compositionFile,
	compositionId,
	destinationFileName,
	remotionRoot,
}: {
	ast: File;
	compositionFile: string;
	compositionId: string;
	destinationFileName: string;
	remotionRoot: string;
}) => {
	const sourceLocation = await resolveCompositionComponentWithFile({
		remotionRoot,
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

	const sourcePath = getImportPathBetweenFiles({
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

	if (rootNode.type === 'JSXElement' && rootNode.openingElement.selfClosing) {
		const fragment = recast.types.builders.jsxFragment(
			recast.types.builders.jsxOpeningFragment(),
			recast.types.builders.jsxClosingFragment(),
			[
				createSequenceWithChild({
					child: stripParenthesizedExtra(rootNode),
					sequenceLocalName: ensureSequenceImport(ast),
				}),
				element,
			],
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
	remotionRoot,
	fileName,
	exportName,
}: {
	remotionRoot: string;
	fileName: string;
	exportName: string | 'default';
}): Promise<ResolvedCompositionComponentWithFile> => {
	const input = await readSourceFile({remotionRoot, fileName});
	const ast = parseAst(input);
	const astForSequenceSimulation = parseAst(input);
	const location =
		exportName === 'default'
			? findDefaultExportLocation(ast)
			: findLocalSymbolLocation({ast, name: exportName});
	const canAddSequence = canAddSequenceToComponent({
		ast: astForSequenceSimulation,
		exportName,
	});

	return {
		source: path.relative(remotionRoot, fileName),
		fileName,
		exportName,
		line: location?.line ?? 1,
		column: location?.column ?? 0,
		canAddSequence,
	};
};

const getComponentLocationRecursively = async ({
	remotionRoot,
	fileName,
	exportName,
	visited,
}: {
	remotionRoot: string;
	fileName: string;
	exportName: string | 'default';
	visited: Set<string>;
}): Promise<ResolvedCompositionComponentWithFile> => {
	const key = `${fileName}:${exportName}`;
	if (visited.has(key)) {
		throw new Error(
			`Could not resolve component export "${exportName}" in ${path.relative(remotionRoot, fileName)}`,
		);
	}

	visited.add(key);
	try {
		const input = await readSourceFile({remotionRoot, fileName});
		const ast = parseAst(input);
		const localDeclaration = getDeclarationByExportName({
			ast,
			exportName,
		});
		if (localDeclaration) {
			return await getComponentLocationInFile({
				remotionRoot,
				fileName,
				exportName,
			});
		}

		const reExportTargets = findReExportTargets({
			ast,
			exportName,
		});
		for (const target of reExportTargets) {
			try {
				const resolvedImportPath = resolveImportPath({
					importPath: target.importPath,
					fromFile: fileName,
				});

				return await getComponentLocationRecursively({
					remotionRoot,
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
				`Could not resolve component export "${exportName}" in ${path.relative(remotionRoot, fileName)}`,
			);
		}

		return await getComponentLocationInFile({
			remotionRoot,
			fileName,
			exportName,
		});
	} finally {
		visited.delete(key);
	}
};

export const resolveCompositionComponentWithFile = async ({
	remotionRoot,
	compositionFile,
	compositionId,
}: {
	remotionRoot: string;
	compositionFile: string;
	compositionId: string;
}): Promise<ResolvedCompositionComponentWithFile> => {
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
		return getComponentLocationRecursively({
			remotionRoot,
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
			remotionRoot,
			fileName: compositionFileName,
			exportName: componentName,
		});
	}

	const importedComponentFile = resolveImportPath({
		importPath: importTarget.importPath,
		fromFile: compositionFileName,
	});

	return getComponentLocationRecursively({
		remotionRoot,
		fileName: importedComponentFile,
		exportName: importTarget.exportName,
		visited: new Set(),
	});
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
	const {source, line, column, canAddSequence} =
		await resolveCompositionComponentWithFile({
			remotionRoot,
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

const createInsertableJsxElement = ({
	addPositionStyleToComponent,
	ast,
	destinationFileName,
	element,
	remotionRoot,
}: {
	addPositionStyleToComponent: boolean;
	ast: File;
	destinationFileName: string;
	element: InsertableCompositionElement;
	remotionRoot: string;
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
			localName: componentLocalName,
			props: element.props,
			position: element.position,
		});
	}

	if (element.type === 'svg') {
		return createSvgElement({
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
				remotionRoot,
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
				element.assetType === 'video'
					? (element.durationInFrames ?? null)
					: null,
			localName,
			staticFileLocalName,
			src: element.src,
			dimensions: element.dimensions,
			position: element.position,
		});
	}

	throw new Error('Unsupported element type');
};

export const insertJsxElementIntoComposition = async ({
	remotionRoot,
	compositionFile,
	compositionId,
	element,
	prettierConfigOverride,
	wrapInSequence = null,
}: {
	remotionRoot: string;
	compositionFile: string;
	compositionId: string;
	element: InsertableCompositionElement;
	prettierConfigOverride: Record<string, unknown> | null;
	wrapInSequence?: {
		dimensions: {width: number; height: number} | null;
		durationInFrames?: number | null;
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
}> => {
	const location = await resolveCompositionComponentWithFile({
		remotionRoot,
		compositionFile,
		compositionId,
	});
	if (!location.canAddSequence) {
		throw new Error(
			'Cannot insert JSX element into this composition component',
		);
	}

	const input = await readSourceFile({
		remotionRoot,
		fileName: location.fileName,
	});
	const ast = parseAst(input);
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
				}
			: wrapInSequence;
	const elementToInsert = await createInsertableJsxElement({
		addPositionStyleToComponent: sequenceWrapper === null,
		ast,
		destinationFileName: location.fileName,
		element,
		remotionRoot,
	});
	const finalElementToInsert = sequenceWrapper
		? createSequenceWrappedElement({
				child: elementToInsert,
				dimensions: sequenceWrapper.dimensions,
				durationInFrames: sequenceWrapper.durationInFrames ?? null,
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

	const finalFile = serializeAst(ast);
	const {output, formatted} = await formatFileContent({
		input: finalFile,
		prettierConfigOverride,
	});

	return {
		fileName: location.fileName,
		source: location.source,
		oldContents: input,
		output,
		formatted,
		logLine,
	};
};
