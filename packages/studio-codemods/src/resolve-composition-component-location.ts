import {parse} from '@babel/parser';
import type {
	File,
	Identifier,
	JSXAttribute,
	JSXOpeningElement,
	Node,
	Statement,
	StringLiteral,
} from '@babel/types';

// Keep this entry browser-safe. The main codemod entry imports Recast, which
// depends on Node built-ins and cannot be loaded by a static Studio bundle.

export type SourceMapProject = {
	files: Record<string, string>;
	rootDir: string;
};

const parseSource = (source: string): File => {
	return parse(source, {
		errorRecovery: false,
		plugins: ['decorators-legacy', 'jsx', 'typescript', 'importAttributes'],
		sourceType: 'module',
	});
};

const isNode = (value: unknown): value is Node => {
	return (
		typeof value === 'object' &&
		value !== null &&
		'type' in value &&
		typeof value.type === 'string'
	);
};

const visit = (value: unknown, visitor: (node: Node) => boolean): boolean => {
	if (Array.isArray(value)) {
		return value.some((item) => visit(item, visitor));
	}

	if (!isNode(value)) {
		return false;
	}

	if (visitor(value)) {
		return true;
	}

	return Object.entries(value).some(([key, child]) => {
		if (
			key === 'loc' ||
			key === 'start' ||
			key === 'end' ||
			key === 'extra' ||
			key === 'comments'
		) {
			return false;
		}

		return visit(child, visitor);
	});
};

const normalizePath = (input: string) => {
	const hasLeadingSlash = input.startsWith('/');
	const parts: string[] = [];

	for (const part of input.replaceAll('\\', '/').split('/')) {
		if (!part || part === '.') {
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

const getProjectFile = ({
	filePath,
	project,
}: {
	filePath: string;
	project: SourceMapProject;
}) => {
	const normalizedInput = normalizePath(
		filePath
			.replace(/^webpack:\/\/\/?/, '/')
			.replace(/^file:\/\//, '')
			.split(/[?#]/, 1)[0],
	);
	const normalizedRoot = normalizePath(project.rootDir);
	const normalizedFiles = new Map(
		Object.keys(project.files).map((key) => [normalizePath(key), key]),
	);
	const candidates = [
		normalizedInput,
		normalizePath(`/${normalizedInput}`),
		normalizePath(`${normalizedRoot}/${normalizedInput.replace(/^\//, '')}`),
	];

	for (const candidate of candidates) {
		const match = normalizedFiles.get(candidate);
		if (match) {
			return match;
		}
	}

	const suffix = `/${normalizedInput.replace(/^\//, '')}`;
	const suffixMatches = [...normalizedFiles.entries()].filter(([key]) =>
		key.endsWith(suffix),
	);
	if (suffixMatches.length === 1) {
		return suffixMatches[0][1];
	}

	throw new Error(`Could not find source file "${filePath}"`);
};

const resolveImport = ({
	fromFile,
	importPath,
	project,
}: {
	fromFile: string;
	importPath: string;
	project: SourceMapProject;
}) => {
	if (!importPath.startsWith('.')) {
		throw new Error(`Cannot resolve package import "${importPath}"`);
	}

	const normalizedFrom = normalizePath(fromFile);
	const lastSlash = normalizedFrom.lastIndexOf('/');
	const directory = lastSlash === -1 ? '' : normalizedFrom.slice(0, lastSlash);
	const basePath = normalizePath(`${directory}/${importPath}`);
	const candidates = [
		basePath,
		...['.tsx', '.ts', '.jsx', '.js'].map(
			(extension) => `${basePath}${extension}`,
		),
		...['.tsx', '.ts', '.jsx', '.js'].map(
			(extension) => `${basePath}/index${extension}`,
		),
	];
	const normalizedFiles = new Map(
		Object.keys(project.files).map((key) => [normalizePath(key), key]),
	);

	for (const candidate of candidates) {
		const match = normalizedFiles.get(candidate);
		if (match) {
			return match;
		}
	}

	throw new Error(`Could not find imported component file "${importPath}"`);
};

const jsxName = (name: JSXOpeningElement['name']): string | null => {
	if (name.type === 'JSXIdentifier') {
		return name.name;
	}

	if (name.type === 'JSXMemberExpression') {
		const object = jsxName(name.object);
		const property = jsxName(name.property);
		return object && property ? `${object}.${property}` : null;
	}

	return null;
};

const getAttribute = (element: JSXOpeningElement, name: string) => {
	return (
		element.attributes.find(
			(attribute): attribute is JSXAttribute =>
				attribute.type === 'JSXAttribute' &&
				attribute.name.type === 'JSXIdentifier' &&
				attribute.name.name === name,
		) ?? null
	);
};

const getStringAttribute = (attribute: JSXAttribute | null) => {
	if (attribute?.value?.type === 'StringLiteral') {
		return attribute.value.value;
	}

	if (
		attribute?.value?.type === 'JSXExpressionContainer' &&
		attribute.value.expression.type === 'StringLiteral'
	) {
		return attribute.value.expression.value;
	}

	return null;
};

const getIdentifierAttribute = (attribute: JSXAttribute | null) => {
	return attribute?.value?.type === 'JSXExpressionContainer' &&
		attribute.value.expression.type === 'Identifier'
		? attribute.value.expression.name
		: null;
};

const findComposition = (file: File, compositionId: string) => {
	let result: JSXOpeningElement | null = null;
	visit(file, (node) => {
		if (node.type !== 'JSXOpeningElement') {
			return false;
		}

		const name = jsxName(node.name);
		if (
			name !== 'Composition' &&
			name !== 'Still' &&
			!name?.endsWith('.Composition') &&
			!name?.endsWith('.Still')
		) {
			return false;
		}

		if (getStringAttribute(getAttribute(node, 'id')) === compositionId) {
			result = node;
			return true;
		}

		return false;
	});

	return result;
};

const findLazyImport = (attribute: JSXAttribute | null) => {
	let importPath: string | null = null;
	visit(attribute, (node) => {
		if (
			node.type === 'ImportExpression' &&
			node.source.type === 'StringLiteral'
		) {
			importPath = node.source.value;
			return true;
		}

		if (
			node.type === 'CallExpression' &&
			node.callee.type === 'Import' &&
			node.arguments[0]?.type === 'StringLiteral'
		) {
			importPath = node.arguments[0].value;
			return true;
		}

		return false;
	});

	return importPath;
};

const getDeclaration = (
	statement: Statement,
	name: string | 'default',
): Node | null => {
	if (name === 'default' && statement.type === 'ExportDefaultDeclaration') {
		return statement.declaration.type === 'Identifier'
			? null
			: statement.declaration;
	}

	const declaration =
		statement.type === 'ExportNamedDeclaration'
			? statement.declaration
			: statement;
	if (!declaration) {
		return null;
	}

	if (
		(declaration.type === 'FunctionDeclaration' ||
			declaration.type === 'ClassDeclaration') &&
		declaration.id?.name === name
	) {
		return declaration;
	}

	if (declaration.type === 'VariableDeclaration') {
		return (
			declaration.declarations.find(
				(item) => item.id.type === 'Identifier' && item.id.name === name,
			) ?? null
		);
	}

	return null;
};

const getExportedName = (name: Identifier | StringLiteral) => {
	return name.type === 'Identifier' ? name.name : name.value;
};

const resolveDeclaration = ({
	filePath,
	exportName,
	project,
	visited,
}: {
	filePath: string;
	exportName: string | 'default';
	project: SourceMapProject;
	visited: Set<string>;
}): {declaration: Node; filePath: string} => {
	const key = `${filePath}:${exportName}`;
	if (visited.has(key)) {
		throw new Error(
			`Circular component export while resolving "${exportName}"`,
		);
	}

	visited.add(key);
	const source = project.files[filePath];
	if (typeof source !== 'string') {
		throw new Error(`Could not read source file "${filePath}"`);
	}

	const file = parseSource(source);
	if (exportName === 'default') {
		const defaultExport = file.program.body.find(
			(statement) => statement.type === 'ExportDefaultDeclaration',
		);
		if (
			defaultExport?.type === 'ExportDefaultDeclaration' &&
			defaultExport.declaration.type === 'Identifier'
		) {
			return resolveDeclaration({
				filePath,
				exportName: defaultExport.declaration.name,
				project,
				visited,
			});
		}
	}

	for (const statement of file.program.body) {
		const declaration = getDeclaration(statement, exportName);
		if (declaration) {
			return {declaration, filePath};
		}
	}

	if (exportName !== 'default') {
		for (const statement of file.program.body) {
			if (
				statement.type !== 'ExportNamedDeclaration' ||
				statement.source?.type !== 'StringLiteral'
			) {
				continue;
			}

			for (const specifier of statement.specifiers) {
				if (
					specifier.type !== 'ExportSpecifier' ||
					getExportedName(specifier.exported) !== exportName
				) {
					continue;
				}

				return resolveDeclaration({
					filePath: resolveImport({
						fromFile: filePath,
						importPath: statement.source.value,
						project,
					}),
					exportName: getExportedName(specifier.local),
					project,
					visited,
				});
			}
		}
	}

	throw new Error(`Could not find composition component "${exportName}"`);
};

const findImportedComponent = (file: File, localName: string) => {
	for (const statement of file.program.body) {
		if (statement.type !== 'ImportDeclaration') {
			continue;
		}

		for (const specifier of statement.specifiers) {
			if (specifier.local.name !== localName) {
				continue;
			}

			if (specifier.type === 'ImportDefaultSpecifier') {
				return {exportName: 'default' as const, path: statement.source.value};
			}

			if (specifier.type === 'ImportSpecifier') {
				return {
					exportName: getExportedName(specifier.imported),
					path: statement.source.value,
				};
			}
		}
	}

	return null;
};

export const resolveCompositionComponentLocation = ({
	compositionFile,
	compositionId,
	project,
}: {
	compositionFile: string;
	compositionId: string;
	project: SourceMapProject;
}) => {
	const registrationFile = getProjectFile({
		filePath: compositionFile,
		project,
	});
	const registrationSource = project.files[registrationFile];
	if (typeof registrationSource !== 'string') {
		throw new Error(`Could not read source file "${registrationFile}"`);
	}

	const registration = parseSource(registrationSource);
	const composition = findComposition(registration, compositionId);
	if (!composition) {
		throw new Error(`Could not find composition "${compositionId}"`);
	}

	const lazyImport = findLazyImport(getAttribute(composition, 'lazyComponent'));
	let componentFile = registrationFile;
	let exportName: string | 'default' = 'default';
	if (lazyImport) {
		componentFile = resolveImport({
			fromFile: registrationFile,
			importPath: lazyImport,
			project,
		});
	} else {
		const componentName = getIdentifierAttribute(
			getAttribute(composition, 'component'),
		);
		if (!componentName) {
			throw new Error(
				`Could not find a component prop for composition "${compositionId}"`,
			);
		}

		const imported = findImportedComponent(registration, componentName);
		if (imported) {
			componentFile = resolveImport({
				fromFile: registrationFile,
				importPath: imported.path,
				project,
			});
			exportName = imported.exportName;
		} else {
			exportName = componentName;
		}
	}

	const {declaration, filePath} = resolveDeclaration({
		filePath: componentFile,
		exportName,
		project,
		visited: new Set(),
	});
	const normalizedFile = normalizePath(filePath);
	const normalizedRoot = normalizePath(project.rootDir).replace(/\/$/, '');
	const source = normalizedFile.startsWith(`${normalizedRoot}/`)
		? normalizedFile.slice(normalizedRoot.length + 1)
		: normalizedFile.replace(/^\//, '');

	return {
		source,
		line: declaration.loc?.start.line ?? 1,
		column: declaration.loc?.start.column ?? 0,
	};
};
