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
import {getInteractiveComponent} from './get-interactive-component';
import {
	getDynamicImportPath,
	getLazyComponentImport,
} from './get-lazy-component-import';

// Keep this entry browser-safe. The main codemod entry imports Recast, which
// depends on Node built-ins and cannot be loaded by a static Studio bundle.

export type SourceMapProject = {
	files: Record<string, string>;
	rootDir: string;
};

export type ResolvedCompositionComponentInProject = {
	canAddSequence: boolean;
	declaration: Node;
	exportName: string | 'default';
	filePath: string;
	location: {
		column: number;
		line: number;
		source: string;
	};
	root: Node;
	source: string;
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
}): {
	declaration: Node;
	exportName: string | 'default';
	filePath: string;
	source: string;
} => {
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
	let localName = exportName;
	if (exportName === 'default') {
		const defaultExport = file.program.body.find(
			(statement) => statement.type === 'ExportDefaultDeclaration',
		);
		if (
			defaultExport?.type === 'ExportDefaultDeclaration' &&
			defaultExport.declaration.type === 'Identifier'
		) {
			localName = defaultExport.declaration.name;
		}
	}

	for (const statement of file.program.body) {
		let declaration = getDeclaration(statement, localName);
		if (declaration) {
			let component = getInteractiveComponent({ast: file, declaration});
			while (component) {
				if (component.type === 'Identifier') {
					return resolveDeclaration({
						filePath,
						exportName: component.name,
						project,
						visited,
					});
				}

				declaration = component;
				component = getInteractiveComponent({ast: file, declaration});
			}

			return {declaration, exportName, filePath, source};
		}
	}

	const importedComponent = findImportedComponent(file, localName);
	if (importedComponent) {
		return resolveDeclaration({
			filePath: resolveImport({
				fromFile: filePath,
				importPath: importedComponent.path,
				project,
			}),
			exportName: importedComponent.exportName,
			project,
			visited,
		});
	}

	if (exportName !== 'default') {
		for (const statement of file.program.body) {
			if (statement.type !== 'ExportNamedDeclaration') {
				continue;
			}

			for (const specifier of statement.specifiers) {
				if (
					specifier.type !== 'ExportSpecifier' ||
					getExportedName(specifier.exported) !== exportName
				) {
					continue;
				}

				if (statement.source?.type === 'StringLiteral') {
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

				// Barrel files that import a component and export it separately.
				const imported = findImportedComponent(
					file,
					getExportedName(specifier.local),
				);
				if (imported) {
					return resolveDeclaration({
						filePath: resolveImport({
							fromFile: filePath,
							importPath: imported.path,
							project,
						}),
						exportName: imported.exportName,
						project,
						visited,
					});
				}
			}
		}

		for (const statement of file.program.body) {
			if (
				statement.type !== 'ExportAllDeclaration' ||
				statement.source.type !== 'StringLiteral'
			) {
				continue;
			}

			try {
				return resolveDeclaration({
					filePath: resolveImport({
						fromFile: filePath,
						importPath: statement.source.value,
						project,
					}),
					exportName,
					project,
					visited,
				});
			} catch {
				// The export may come from another re-exported module.
			}
		}
	}

	throw new Error(`Could not find composition component "${exportName}"`);
};

const unwrapExpression = (node: Node | null): Node | null => {
	let current = node;
	while (
		current &&
		(current.type === 'TSAsExpression' ||
			current.type === 'TSSatisfiesExpression' ||
			current.type === 'TypeCastExpression' ||
			current.type === 'ParenthesizedExpression')
	) {
		current = current.expression;
	}

	return current;
};

const getReturnedRoot = (declaration: Node) => {
	let fn: Node | null = declaration;
	if (declaration.type === 'VariableDeclarator') {
		fn = unwrapExpression(declaration.init ?? null);
	}

	if (
		!fn ||
		(fn.type !== 'ArrowFunctionExpression' &&
			fn.type !== 'FunctionExpression' &&
			fn.type !== 'FunctionDeclaration')
	) {
		return null;
	}

	const body = unwrapExpression(fn.body);
	if (!body) {
		return null;
	}

	if (body.type !== 'BlockStatement') {
		return body;
	}

	const returnStatements = body.body.filter(
		(statement) => statement.type === 'ReturnStatement',
	);
	if (
		returnStatements.length !== 1 ||
		returnStatements[0] !== body.body.at(-1)
	) {
		return null;
	}

	return unwrapExpression(returnStatements[0].argument ?? null);
};

const isCanvasRoot = (root: Node) => {
	if (root.type !== 'JSXElement') {
		return false;
	}

	const name = jsxName(root.openingElement.name);
	return (
		name === 'ThreeCanvas' ||
		name === 'RiveCanvas' ||
		name === 'SkiaCanvas' ||
		name === 'canvas'
	);
};

const canAddToRoot = (root: Node) => {
	if (root.type === 'NullLiteral') {
		return true;
	}

	return (
		(root.type === 'JSXElement' || root.type === 'JSXFragment') &&
		!isCanvasRoot(root)
	);
};

const resolveCompositionComponentDeclaration = ({
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

	const lazyComponent = getAttribute(composition, 'lazyComponent')?.value;
	const lazyImport =
		lazyComponent?.type === 'JSXExpressionContainer'
			? getLazyComponentImport(lazyComponent.expression)
			: null;
	let componentFile = registrationFile;
	let exportName: string | 'default' = 'default';
	if (lazyImport) {
		componentFile = resolveImport({
			fromFile: registrationFile,
			importPath: lazyImport.importPath,
			project,
		});
		exportName = lazyImport.exportName;
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

	const resolved = resolveDeclaration({
		filePath: componentFile,
		exportName,
		project,
		visited: new Set(),
	});
	const normalizedFile = normalizePath(resolved.filePath);
	const normalizedRoot = normalizePath(project.rootDir).replace(/\/$/, '');
	const source = normalizedFile.startsWith(`${normalizedRoot}/`)
		? normalizedFile.slice(normalizedRoot.length + 1)
		: normalizedFile.replace(/^\//, '');

	return {
		...resolved,
		location: {
			source,
			line: resolved.declaration.loc?.start.line ?? 1,
			column: resolved.declaration.loc?.start.column ?? 0,
		},
	};
};

export const resolveCompositionComponentInProject = ({
	compositionFile,
	compositionId,
	project,
}: {
	compositionFile: string;
	compositionId: string;
	project: SourceMapProject;
}): ResolvedCompositionComponentInProject => {
	const resolved = resolveCompositionComponentDeclaration({
		compositionFile,
		compositionId,
		project,
	});
	const root = getReturnedRoot(resolved.declaration);
	if (!root) {
		throw new Error('Composition component does not return JSX');
	}

	return {
		...resolved,
		canAddSequence: canAddToRoot(root),
		root,
	};
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
	return resolveCompositionComponentDeclaration({
		compositionFile,
		compositionId,
		project,
	}).location;
};

export const resolveRootComponentInProject = ({
	entryPoint,
	project,
}: {
	entryPoint: string;
	project: SourceMapProject;
}) => {
	const filePath = getProjectFile({filePath: entryPoint, project});
	const ast = parseSource(project.files[filePath]);
	const registerNames = new Set<string>();
	const namespaceNames = new Set<string>();
	for (const statement of ast.program.body) {
		if (
			statement.type !== 'ImportDeclaration' ||
			statement.source.value !== 'remotion'
		) {
			continue;
		}

		for (const specifier of statement.specifiers) {
			if (
				specifier.type === 'ImportSpecifier' &&
				getExportedName(specifier.imported) === 'registerRoot'
			) {
				registerNames.add(specifier.local.name);
			} else if (specifier.type === 'ImportNamespaceSpecifier') {
				namespaceNames.add(specifier.local.name);
			}
		}
	}

	const components: {name: string; call: Node}[] = [];
	visit(ast, (node) => {
		if (node.type !== 'CallExpression') {
			return false;
		}

		const {callee} = node;
		const isRegisterRoot =
			callee.type === 'Identifier'
				? registerNames.has(callee.name)
				: callee.type === 'MemberExpression' &&
					!callee.computed &&
					callee.object.type === 'Identifier' &&
					namespaceNames.has(callee.object.name) &&
					callee.property.type === 'Identifier' &&
					callee.property.name === 'registerRoot';
		if (isRegisterRoot && node.arguments[0]?.type === 'Identifier') {
			components.push({name: node.arguments[0].name, call: node});
		}

		return false;
	});
	if (components.length !== 1) {
		throw new Error(
			'Expected a single registerRoot() call with a component identifier.',
		);
	}

	const {name, call} = components[0];
	const scopes: Array<Extract<Node, {type: 'Program' | 'BlockStatement'}>> = [];
	visit(ast, (node) => {
		if (
			(node.type === 'Program' || node.type === 'BlockStatement') &&
			typeof node.start === 'number' &&
			typeof node.end === 'number' &&
			typeof call.start === 'number' &&
			typeof call.end === 'number' &&
			node.start <= call.start &&
			node.end >= call.end
		) {
			scopes.push(node);
		}

		return false;
	});
	scopes.sort((a, b) => a.end! - a.start! - (b.end! - b.start!));
	let dynamicImport = null as {importPath: string; exportName: string} | null;
	scopes.some((scope) =>
		scope.body.some((statement) => {
			if (
				statement.type === 'FunctionDeclaration' &&
				statement.id?.name === name
			) {
				if (scope.type !== 'Program') {
					throw new Error(`Cannot resolve the local root component "${name}".`);
				}

				return true;
			}

			if (statement.type !== 'VariableDeclaration') {
				return false;
			}

			return statement.declarations.some((declaration) => {
				if (
					declaration.id.type === 'Identifier' &&
					declaration.id.name === name
				) {
					if (scope.type !== 'Program') {
						throw new Error(
							`Cannot resolve the local root component "${name}".`,
						);
					}

					return true;
				}

				if (declaration.id.type !== 'ObjectPattern') {
					return false;
				}

				const property = declaration.id.properties.find(
					(prop) =>
						prop.type === 'ObjectProperty' &&
						prop.value.type === 'Identifier' &&
						prop.value.name === name,
				);
				if (!property || property.type !== 'ObjectProperty') {
					return false;
				}

				const initial = unwrapExpression(declaration.init ?? null);
				const imported =
					initial?.type === 'AwaitExpression'
						? unwrapExpression(initial.argument)
						: initial;
				const importPath =
					imported === null ? null : getDynamicImportPath(imported);
				const exportName =
					!property.computed && property.key.type === 'Identifier'
						? property.key.name
						: property.key.type === 'StringLiteral'
							? property.key.value
							: null;
				if (importPath === null || exportName === null) {
					throw new Error(
						`Cannot resolve the root component binding "${name}".`,
					);
				}

				dynamicImport = {importPath, exportName};
				return true;
			});
		}),
	);

	const resolved = resolveDeclaration({
		filePath:
			dynamicImport === null
				? filePath
				: resolveImport({
						fromFile: filePath,
						importPath: dynamicImport.importPath,
						project,
					}),
		exportName: dynamicImport?.exportName ?? name,
		project,
		visited: new Set(),
	});
	const root = getReturnedRoot(resolved.declaration);
	if (root?.type !== 'JSXElement' && root?.type !== 'JSXFragment') {
		throw new Error('The registered root component must return JSX.');
	}

	return {...resolved, root};
};
