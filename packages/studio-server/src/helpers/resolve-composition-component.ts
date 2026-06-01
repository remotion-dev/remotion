import fs from 'node:fs';
import path from 'node:path';
import type {
	ClassDeclaration,
	ExportAllDeclaration,
	ExportNamedDeclaration,
	ExportSpecifier,
	File,
	FunctionDeclaration,
	ImportDeclaration,
	ImportSpecifier,
	JSXAttribute,
	JSXElement,
	VariableDeclaration,
} from '@babel/types';
import type {InsertableCompositionElement} from '@remotion/studio-shared';
import type {namedTypes} from 'ast-types';
import * as recast from 'recast';
import {formatFileContent} from '../codemods/format-file-content';
import {parseAst, serializeAst} from '../codemods/parse-ast';

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

type ResolvedCompositionComponentWithFile = ResolvedCompositionComponent & {
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

const createSolidElement = ({
	localName,
	width,
	height,
}: {
	localName: string;
	width: number;
	height: number;
}): namedTypes.JSXElement => {
	return recast.types.builders.jsxElement(
		recast.types.builders.jsxOpeningElement(
			recast.types.builders.jsxIdentifier(localName),
			[
				createNumberAttribute('width', width),
				createNumberAttribute('height', height),
			],
			true,
		),
		null,
		[],
	);
};

const getImportedName = (specifier: ImportSpecifier) => {
	if (specifier.imported.type === 'Identifier') {
		return specifier.imported.name;
	}

	return specifier.imported.value;
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

const insertImportDeclaration = (
	ast: File,
	importDeclaration: ImportDeclaration,
) => {
	const {body} = ast.program;
	let lastImportIndex = -1;
	for (let i = 0; i < body.length; i++) {
		if (body[i].type === 'ImportDeclaration') {
			lastImportIndex = i;
		}
	}

	body.splice(lastImportIndex + 1, 0, importDeclaration);
};

const addSolidImport = ({
	ast,
	localName,
	remotionImport,
}: {
	ast: File;
	localName: string;
	remotionImport: ImportDeclaration | null;
}) => {
	const imported = recast.types.builders.identifier('Solid');
	const local =
		localName === 'Solid' ? null : recast.types.builders.identifier(localName);
	const specifier = recast.types.builders.importSpecifier(
		imported,
		local,
	) as unknown as ImportSpecifier;

	const canAddToExistingRemotionImport =
		remotionImport &&
		!remotionImport.specifiers?.some(
			(importSpecifier) => importSpecifier.type === 'ImportNamespaceSpecifier',
		);

	if (canAddToExistingRemotionImport) {
		remotionImport.specifiers = [
			...(remotionImport.specifiers ?? []),
			specifier,
		];
		return;
	}

	const importDeclaration = recast.types.builders.importDeclaration(
		[],
		recast.types.builders.stringLiteral('remotion'),
	) as unknown as ImportDeclaration;
	importDeclaration.specifiers = [specifier];
	insertImportDeclaration(ast, importDeclaration);
};

const ensureSolidImport = (ast: File) => {
	let remotionImport: ImportDeclaration | null = null;

	for (const node of ast.program.body) {
		if (node.type !== 'ImportDeclaration' || node.source.value !== 'remotion') {
			continue;
		}

		remotionImport = node;

		const solidSpecifier = node.specifiers?.find((specifier) => {
			return (
				specifier.type === 'ImportSpecifier' &&
				getImportedName(specifier) === 'Solid'
			);
		});

		if (solidSpecifier?.local?.name) {
			return solidSpecifier.local.name;
		}
	}

	const localName = getAvailableSolidLocalName(ast);
	addSolidImport({ast, localName, remotionImport});
	return localName;
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
		throw new Error('Composition component does not return JSX');
	}

	if (rootNode.type === 'JSXElement' && rootNode.openingElement.selfClosing) {
		throw new Error('Cannot insert into a self-closing root JSX element');
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
			`Cannot insert a <Solid> into a composition whose root element is <${rootNode.openingElement.name.name}>`,
		);
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

const resolveCompositionComponentWithFile = async ({
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
	ast,
	element,
}: {
	ast: File;
	element: InsertableCompositionElement;
}) => {
	if (element.type === 'solid') {
		const solidLocalName = ensureSolidImport(ast);

		return createSolidElement({
			localName: solidLocalName,
			width: element.width,
			height: element.height,
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
}: {
	remotionRoot: string;
	compositionFile: string;
	compositionId: string;
	element: InsertableCompositionElement;
	prettierConfigOverride: Record<string, unknown> | null;
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
	const elementToInsert = createInsertableJsxElement({ast, element});
	const logLine = addElementToComponentRoot({
		ast,
		exportName: location.exportName,
		element: elementToInsert,
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
