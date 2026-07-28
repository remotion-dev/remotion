import {parse} from '@babel/parser';
import type {
	ApiRoutes,
	BrowserStudioServer,
	CompositionComponentInfoRequest,
	InsertJsxElementRequest,
	InsertJsxElementResponse,
} from '@remotion/studio-shared';
import type {VirtualProject} from './types';

type AstNode = {
	type: string;
	start?: number | null;
	end?: number | null;
	loc?: {
		start: {line: number; column: number};
		end: {line: number; column: number};
	} | null;
	[key: string]: unknown;
};

type ResolvedComponent = {
	canAddSequence: boolean;
	declaration: AstNode;
	exportName: string | 'default';
	filePath: string;
	root: AstNode;
	source: string;
};

type TextEdit = {
	end: number;
	start: number;
	text: string;
};

const isAstNode = (value: unknown): value is AstNode => {
	return (
		typeof value === 'object' &&
		value !== null &&
		'type' in value &&
		typeof value.type === 'string'
	);
};

const getNode = (node: AstNode, key: string): AstNode | null => {
	const value = node[key];
	return isAstNode(value) ? value : null;
};

const getNodes = (node: AstNode, key: string): AstNode[] => {
	const value = node[key];
	return Array.isArray(value) ? value.filter(isAstNode) : [];
};

const getString = (node: AstNode | null, key: string): string | null => {
	if (!node) {
		return null;
	}

	const value = node[key];
	return typeof value === 'string' ? value : null;
};

const getPosition = (node: AstNode, key: 'start' | 'end'): number => {
	const value = node[key];
	if (typeof value !== 'number') {
		throw new Error(`Could not determine the ${key} of a source node`);
	}

	return value;
};

const visit = (
	value: unknown,
	visitor: (node: AstNode) => boolean | void,
): boolean => {
	if (Array.isArray(value)) {
		for (const item of value) {
			if (visit(item, visitor)) {
				return true;
			}
		}

		return false;
	}

	if (!isAstNode(value)) {
		return false;
	}

	if (visitor(value)) {
		return true;
	}

	for (const [key, child] of Object.entries(value)) {
		if (
			key === 'loc' ||
			key === 'start' ||
			key === 'end' ||
			key === 'extra' ||
			key === 'comments'
		) {
			continue;
		}

		if (visit(child, visitor)) {
			return true;
		}
	}

	return false;
};

const parseSource = (source: string): AstNode => {
	return parse(source, {
		errorRecovery: false,
		plugins: ['decorators-legacy', 'jsx', 'typescript', 'importAttributes'],
		sourceType: 'module',
	}) as unknown as AstNode;
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

const dirname = (filePath: string) => {
	const normalized = normalizePath(filePath);
	const lastSlash = normalized.lastIndexOf('/');
	return lastSlash === -1 ? '' : normalized.slice(0, lastSlash);
};

const stripSourceProtocol = (filePath: string) => {
	return filePath
		.replace(/^webpack:\/\/\/?/, '/')
		.replace(/^file:\/\//, '')
		.split(/[?#]/, 1)[0];
};

const findProjectFile = ({
	filePath,
	project,
}: {
	filePath: string;
	project: VirtualProject;
}) => {
	const normalizedInput = normalizePath(stripSourceProtocol(filePath));
	const rootDir = normalizePath(project.rootDir);
	const candidates = [
		normalizedInput,
		normalizePath(`/${normalizedInput}`),
		normalizePath(`${rootDir}/${normalizedInput.replace(/^\//, '')}`),
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

	const suffix = `/${normalizedInput.replace(/^\//, '')}`;
	const suffixMatches = [...normalizedFiles.entries()].filter(([key]) =>
		key.endsWith(suffix),
	);
	if (suffixMatches.length === 1) {
		return suffixMatches[0][1];
	}

	throw new Error(`Could not find source file "${filePath}"`);
};

const resolveImportFile = ({
	fromFile,
	importPath,
	project,
}: {
	fromFile: string;
	importPath: string;
	project: VirtualProject;
}) => {
	if (!importPath.startsWith('.')) {
		throw new Error(`Cannot resolve package import "${importPath}"`);
	}

	const basePath = normalizePath(`${dirname(fromFile)}/${importPath}`);
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

const jsxName = (name: AstNode | null): string | null => {
	if (!name) {
		return null;
	}

	if (name.type === 'JSXIdentifier') {
		return getString(name, 'name');
	}

	if (name.type === 'JSXMemberExpression') {
		const object = jsxName(getNode(name, 'object'));
		const property = jsxName(getNode(name, 'property'));
		return object && property ? `${object}.${property}` : null;
	}

	return null;
};

const getJsxAttribute = (openingElement: AstNode, name: string) => {
	return (
		getNodes(openingElement, 'attributes').find((attribute) => {
			return (
				attribute.type === 'JSXAttribute' &&
				jsxName(getNode(attribute, 'name')) === name
			);
		}) ?? null
	);
};

const jsxAttributeString = (attribute: AstNode | null) => {
	const value = attribute ? getNode(attribute, 'value') : null;
	if (!value) {
		return null;
	}

	if (value.type === 'StringLiteral') {
		return getString(value, 'value');
	}

	if (value.type !== 'JSXExpressionContainer') {
		return null;
	}

	const expression = getNode(value, 'expression');
	return expression?.type === 'StringLiteral'
		? getString(expression, 'value')
		: null;
};

const jsxAttributeIdentifier = (attribute: AstNode | null) => {
	const value = attribute ? getNode(attribute, 'value') : null;
	const expression =
		value?.type === 'JSXExpressionContainer'
			? getNode(value, 'expression')
			: null;

	return expression?.type === 'Identifier'
		? getString(expression, 'name')
		: null;
};

const findDynamicImport = (attribute: AstNode | null) => {
	let importPath: string | null = null;
	const value = attribute ? getNode(attribute, 'value') : null;
	visit(value, (node) => {
		if (node.type === 'ImportExpression') {
			const source = getNode(node, 'source');
			if (source?.type === 'StringLiteral') {
				importPath = getString(source, 'value');
				return true;
			}
		}

		if (
			node.type === 'CallExpression' &&
			getNode(node, 'callee')?.type === 'Import'
		) {
			const argument = getNodes(node, 'arguments')[0];
			if (argument?.type === 'StringLiteral') {
				importPath = getString(argument, 'value');
				return true;
			}
		}

		return false;
	});

	return importPath;
};

const findCompositionElement = ({
	ast,
	compositionId,
}: {
	ast: AstNode;
	compositionId: string;
}) => {
	let result: AstNode | null = null;
	visit(ast, (node) => {
		if (node.type !== 'JSXOpeningElement') {
			return false;
		}

		const name = jsxName(getNode(node, 'name'));
		if (
			name !== 'Composition' &&
			name !== 'Still' &&
			!name?.endsWith('.Composition') &&
			!name?.endsWith('.Still')
		) {
			return false;
		}

		if (jsxAttributeString(getJsxAttribute(node, 'id')) === compositionId) {
			result = node;
			return true;
		}

		return false;
	});

	return result;
};

const programStatements = (ast: AstNode) => {
	const program = ast.type === 'File' ? getNode(ast, 'program') : ast;
	if (!program || program.type !== 'Program') {
		throw new Error('Could not parse source file');
	}

	return getNodes(program, 'body');
};

const unwrapDeclaration = (statement: AstNode) => {
	if (
		statement.type === 'ExportNamedDeclaration' &&
		getNode(statement, 'declaration')
	) {
		return getNode(statement, 'declaration');
	}

	return statement;
};

const findNamedDeclaration = (ast: AstNode, name: string) => {
	for (const statement of programStatements(ast)) {
		const declaration = unwrapDeclaration(statement);
		if (!declaration) {
			continue;
		}

		if (
			(declaration.type === 'FunctionDeclaration' ||
				declaration.type === 'ClassDeclaration') &&
			getString(getNode(declaration, 'id'), 'name') === name
		) {
			return declaration;
		}

		if (declaration.type === 'VariableDeclaration') {
			const variable = getNodes(declaration, 'declarations').find(
				(item) => getString(getNode(item, 'id'), 'name') === name,
			);
			if (variable) {
				return variable;
			}
		}
	}

	return null;
};

const findDefaultDeclaration = (ast: AstNode) => {
	for (const statement of programStatements(ast)) {
		if (statement.type !== 'ExportDefaultDeclaration') {
			continue;
		}

		const declaration = getNode(statement, 'declaration');
		if (declaration?.type === 'Identifier') {
			const name = getString(declaration, 'name');
			return name ? findNamedDeclaration(ast, name) : null;
		}

		return declaration;
	}

	return null;
};

const findImport = ({ast, localName}: {ast: AstNode; localName: string}) => {
	for (const statement of programStatements(ast)) {
		if (statement.type !== 'ImportDeclaration') {
			continue;
		}

		const source = getString(getNode(statement, 'source'), 'value');
		for (const specifier of getNodes(statement, 'specifiers')) {
			if (getString(getNode(specifier, 'local'), 'name') !== localName) {
				continue;
			}

			if (specifier.type === 'ImportDefaultSpecifier') {
				return {exportName: 'default' as const, importPath: source};
			}

			if (specifier.type === 'ImportSpecifier') {
				const imported = getNode(specifier, 'imported');
				return {
					exportName:
						getString(imported, 'name') ?? getString(imported, 'value'),
					importPath: source,
				};
			}
		}
	}

	return null;
};

const unwrapExpression = (node: AstNode | null): AstNode | null => {
	let current = node;
	while (
		current &&
		(current.type === 'TSAsExpression' ||
			current.type === 'TSSatisfiesExpression' ||
			current.type === 'TypeCastExpression' ||
			current.type === 'ParenthesizedExpression')
	) {
		current = getNode(current, 'expression');
	}

	return current;
};

const getReturnedRoot = (declaration: AstNode) => {
	let fn: AstNode | null = declaration;
	if (declaration.type === 'VariableDeclarator') {
		fn = unwrapExpression(getNode(declaration, 'init'));
	}

	if (
		!fn ||
		(fn.type !== 'ArrowFunctionExpression' &&
			fn.type !== 'FunctionExpression' &&
			fn.type !== 'FunctionDeclaration')
	) {
		return null;
	}

	const body = unwrapExpression(getNode(fn, 'body'));
	if (!body) {
		return null;
	}

	if (body.type !== 'BlockStatement') {
		return body;
	}

	const statements = getNodes(body, 'body');
	const returnStatements = statements.filter(
		(statement) => statement.type === 'ReturnStatement',
	);
	if (
		returnStatements.length !== 1 ||
		returnStatements[0] !== statements.at(-1)
	) {
		return null;
	}

	return unwrapExpression(getNode(returnStatements[0], 'argument'));
};

const isCanvasRoot = (root: AstNode) => {
	if (root.type !== 'JSXElement') {
		return false;
	}

	const openingElement = getNode(root, 'openingElement');
	const name = jsxName(getNode(openingElement ?? root, 'name'));
	return (
		name === 'ThreeCanvas' ||
		name === 'RiveCanvas' ||
		name === 'SkiaCanvas' ||
		name === 'canvas'
	);
};

const canAddToRoot = (root: AstNode | null): root is AstNode => {
	if (!root) {
		return false;
	}

	if (root.type === 'NullLiteral') {
		return true;
	}

	return (
		(root.type === 'JSXElement' || root.type === 'JSXFragment') &&
		!isCanvasRoot(root)
	);
};

const resolveReExport = ({
	ast,
	exportName,
	filePath,
	project,
}: {
	ast: AstNode;
	exportName: string;
	filePath: string;
	project: VirtualProject;
}): {exportName: string | 'default'; filePath: string} | null => {
	for (const statement of programStatements(ast)) {
		if (
			statement.type !== 'ExportNamedDeclaration' ||
			!getNode(statement, 'source')
		) {
			continue;
		}

		const importPath = getString(getNode(statement, 'source'), 'value');
		for (const specifier of getNodes(statement, 'specifiers')) {
			const exported =
				getString(getNode(specifier, 'exported'), 'name') ??
				getString(getNode(specifier, 'exported'), 'value');
			if (exported !== exportName) {
				continue;
			}

			const imported =
				getString(getNode(specifier, 'local'), 'name') ??
				getString(getNode(specifier, 'local'), 'value');
			if (!importPath || !imported) {
				return null;
			}

			return {
				exportName: imported,
				filePath: resolveImportFile({fromFile: filePath, importPath, project}),
			};
		}
	}

	return null;
};

const resolveComponentDeclaration = ({
	exportName,
	filePath,
	project,
	visited,
}: {
	exportName: string | 'default';
	filePath: string;
	project: VirtualProject;
	visited: Set<string>;
}): {
	ast: AstNode;
	declaration: AstNode;
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

	const ast = parseSource(source);
	const declaration =
		exportName === 'default'
			? findDefaultDeclaration(ast)
			: findNamedDeclaration(ast, exportName);
	if (declaration) {
		return {ast, declaration, exportName, filePath, source};
	}

	if (exportName !== 'default') {
		const reExport = resolveReExport({
			ast,
			exportName,
			filePath,
			project,
		});
		if (reExport) {
			return resolveComponentDeclaration({
				...reExport,
				project,
				visited,
			});
		}
	}

	throw new Error(`Could not find composition component "${exportName}"`);
};

const resolveCompositionComponent = ({
	compositionFile,
	compositionId,
	project,
}: {
	compositionFile: string;
	compositionId: string;
	project: VirtualProject;
}): ResolvedComponent => {
	const registrationFile = findProjectFile({
		filePath: compositionFile,
		project,
	});
	const registrationSource = project.files[registrationFile];
	if (typeof registrationSource !== 'string') {
		throw new Error(`Could not read source file "${registrationFile}"`);
	}

	const registrationAst = parseSource(registrationSource);
	const compositionElement = findCompositionElement({
		ast: registrationAst,
		compositionId,
	});
	if (!compositionElement) {
		throw new Error(`Could not find composition "${compositionId}"`);
	}

	const lazyImportPath = findDynamicImport(
		getJsxAttribute(compositionElement, 'lazyComponent'),
	);
	let componentFile = registrationFile;
	let exportName: string | 'default';
	if (lazyImportPath) {
		componentFile = resolveImportFile({
			fromFile: registrationFile,
			importPath: lazyImportPath,
			project,
		});
		exportName = 'default';
	} else {
		const componentName = jsxAttributeIdentifier(
			getJsxAttribute(compositionElement, 'component'),
		);
		if (!componentName) {
			throw new Error(
				`Could not find a component prop for composition "${compositionId}"`,
			);
		}

		const componentImport = findImport({
			ast: registrationAst,
			localName: componentName,
		});
		if (componentImport?.importPath && componentImport.exportName) {
			componentFile = resolveImportFile({
				fromFile: registrationFile,
				importPath: componentImport.importPath,
				project,
			});
			exportName = componentImport.exportName;
		} else {
			exportName = componentName;
		}
	}

	const resolved = resolveComponentDeclaration({
		exportName,
		filePath: componentFile,
		project,
		visited: new Set(),
	});
	const root = getReturnedRoot(resolved.declaration);

	return {
		canAddSequence: canAddToRoot(root),
		declaration: resolved.declaration,
		exportName: resolved.exportName,
		filePath: resolved.filePath,
		root:
			root ??
			(() => {
				throw new Error('Composition component does not return JSX');
			})(),
		source: resolved.source,
	};
};

const collectBindings = (ast: AstNode) => {
	const bindings = new Set<string>();
	visit(ast, (node) => {
		if (
			node.type === 'VariableDeclarator' ||
			node.type === 'FunctionDeclaration' ||
			node.type === 'ClassDeclaration' ||
			node.type === 'ImportSpecifier' ||
			node.type === 'ImportDefaultSpecifier' ||
			node.type === 'ImportNamespaceSpecifier'
		) {
			const identifier = node.type.startsWith('Import')
				? getNode(node, 'local')
				: getNode(node, 'id');
			const name = getString(identifier, 'name');
			if (name) {
				bindings.add(name);
			}
		}

		return false;
	});

	return bindings;
};

const findImportedLocalName = ({
	ast,
	importedName,
}: {
	ast: AstNode;
	importedName: string;
}) => {
	for (const statement of programStatements(ast)) {
		if (
			statement.type !== 'ImportDeclaration' ||
			getString(getNode(statement, 'source'), 'value') !== 'remotion'
		) {
			continue;
		}

		for (const specifier of getNodes(statement, 'specifiers')) {
			if (
				specifier.type === 'ImportSpecifier' &&
				(getString(getNode(specifier, 'imported'), 'name') ??
					getString(getNode(specifier, 'imported'), 'value')) === importedName
			) {
				return getString(getNode(specifier, 'local'), 'name');
			}
		}
	}

	return null;
};

const chooseLocalName = ({
	ast,
	candidates,
	importedName,
}: {
	ast: AstNode;
	candidates: string[];
	importedName: string;
}) => {
	const existing = findImportedLocalName({ast, importedName});
	if (existing) {
		return {addImport: false, localName: existing};
	}

	const bindings = collectBindings(ast);
	const localName = candidates.find((candidate) => !bindings.has(candidate));
	if (!localName) {
		throw new Error(
			`Cannot add <${importedName}> because all supported local names are defined`,
		);
	}

	return {addImport: true, localName};
};

const getImportEdit = ({
	ast,
	imports,
}: {
	ast: AstNode;
	imports: {importedName: string; localName: string}[];
}): TextEdit | null => {
	if (imports.length === 0) {
		return null;
	}

	const specifiers = imports
		.map(({importedName, localName}) =>
			importedName === localName
				? importedName
				: `${importedName} as ${localName}`,
		)
		.join(', ');
	const firstImport = programStatements(ast).find(
		(statement) => statement.type === 'ImportDeclaration',
	);
	const start = firstImport ? getPosition(firstImport, 'start') : 0;

	return {
		end: start,
		start,
		text: `import {${specifiers}} from 'remotion';\n`,
	};
};

const lineIndentAt = (source: string, position: number) => {
	const lineStart = source.lastIndexOf('\n', position - 1) + 1;
	return source.slice(lineStart, position).match(/^\s*/)?.[0] ?? '';
};

const indentationUnit = (source: string) => {
	if (/^\t+/m.test(source)) {
		return '\t';
	}

	const indentation = source.match(/^([ ]+)\S/m)?.[1].length;
	return ' '.repeat(indentation && indentation > 1 ? indentation : 2);
};

const roundCoordinate = (value: number) => {
	const rounded = Math.round(value * 10) / 10;
	return Object.is(rounded, -0) ? 0 : rounded;
};

const solidElement = ({
	height,
	localName,
	position,
	width,
}: {
	height: number;
	localName: string;
	position: {x: number; y: number} | null;
	width: number;
}) => {
	const translate = position
		? `, translate: '${roundCoordinate(position.x)}px ${roundCoordinate(position.y)}px'`
		: '';

	return `<${localName} width={${width}} height={${height}} color="gray" style={{position: 'absolute'${translate}}} />`;
};

const appendToJsxRoot = ({
	element,
	root,
	source,
	unit,
}: {
	element: string;
	root: AstNode;
	source: string;
	unit: string;
}): TextEdit => {
	const closing =
		root.type === 'JSXFragment'
			? getNode(root, 'closingFragment')
			: getNode(root, 'closingElement');
	if (!closing) {
		throw new Error('Composition component root does not accept children');
	}

	const closingStart = getPosition(closing, 'start');
	const lineStart = source.lastIndexOf('\n', closingStart - 1) + 1;
	const beforeClosing = source.slice(lineStart, closingStart);
	const closingIndent = beforeClosing.match(/^\s*$/)
		? beforeClosing
		: lineIndentAt(source, getPosition(root, 'start'));

	if (/^\s*$/.test(beforeClosing) && lineStart > 0) {
		return {
			start: lineStart,
			end: closingStart,
			text: `${closingIndent}${unit}${element}\n${closingIndent}`,
		};
	}

	return {
		start: closingStart,
		end: closingStart,
		text: `\n${closingIndent}${unit}${element}\n${closingIndent}`,
	};
};

const replaceNullRoot = ({
	element,
	root,
	source,
	unit,
}: {
	element: string;
	root: AstNode;
	source: string;
	unit: string;
}): TextEdit => {
	const indent = lineIndentAt(source, getPosition(root, 'start'));
	return {
		start: getPosition(root, 'start'),
		end: getPosition(root, 'end'),
		text: `(\n${indent}${unit}<>\n${indent}${unit}${unit}${element}\n${indent}${unit}</>\n${indent})`,
	};
};

const replaceSelfClosingRoot = ({
	element,
	root,
	sequenceLocalName,
	source,
	unit,
}: {
	element: string;
	root: AstNode;
	sequenceLocalName: string;
	source: string;
	unit: string;
}): TextEdit => {
	const start = getPosition(root, 'start');
	const indent = lineIndentAt(source, start);
	const original = source.slice(start, getPosition(root, 'end'));

	return {
		start,
		end: getPosition(root, 'end'),
		text: [
			'<>',
			`${indent}${unit}<${sequenceLocalName}>`,
			`${indent}${unit}${unit}${original}`,
			`${indent}${unit}</${sequenceLocalName}>`,
			`${indent}${unit}${element}`,
			`${indent}</>`,
		].join('\n'),
	};
};

const applyTextEdits = (source: string, edits: TextEdit[]) => {
	const sorted = [...edits].sort((a, b) => b.start - a.start);
	let output = source;
	let previousStart = source.length + 1;

	for (const edit of sorted) {
		if (edit.end > previousStart) {
			throw new Error('Overlapping source edits');
		}

		output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
		previousStart = edit.start;
	}

	return output;
};

export const insertSolidIntoProject = ({
	project,
	request,
}: {
	project: VirtualProject;
	request: InsertJsxElementRequest;
}): VirtualProject => {
	if (request.element.type !== 'solid') {
		throw new Error('Browser Studio currently only supports adding <Solid>');
	}

	if (request.from !== null) {
		throw new Error(
			'Browser Studio currently only supports adding <Solid> at the current root',
		);
	}

	const resolved = resolveCompositionComponent({
		compositionFile: request.compositionFile,
		compositionId: request.compositionId,
		project,
	});
	if (!resolved.canAddSequence) {
		throw new Error(
			'Cannot insert JSX element into this composition component',
		);
	}

	const ast = parseSource(resolved.source);
	const solidImport = chooseLocalName({
		ast,
		candidates: ['Solid', 'RemotionSolid'],
		importedName: 'Solid',
	});
	const openingElement =
		resolved.root.type === 'JSXElement'
			? getNode(resolved.root, 'openingElement')
			: null;
	const isSelfClosing = openingElement?.selfClosing === true;
	const sequenceImport = isSelfClosing
		? chooseLocalName({
				ast,
				candidates: ['Sequence', 'RemotionSequence'],
				importedName: 'Sequence',
			})
		: null;
	const imports = [
		...(solidImport.addImport
			? [{importedName: 'Solid', localName: solidImport.localName}]
			: []),
		...(sequenceImport?.addImport
			? [{importedName: 'Sequence', localName: sequenceImport.localName}]
			: []),
	];
	const unit = indentationUnit(resolved.source);
	const element = solidElement({
		height: request.element.height,
		localName: solidImport.localName,
		position: request.element.position,
		width: request.element.width,
	});
	const rootEdit =
		resolved.root.type === 'NullLiteral'
			? replaceNullRoot({
					element,
					root: resolved.root,
					source: resolved.source,
					unit,
				})
			: isSelfClosing && sequenceImport
				? replaceSelfClosingRoot({
						element,
						root: resolved.root,
						sequenceLocalName: sequenceImport.localName,
						source: resolved.source,
						unit,
					})
				: appendToJsxRoot({
						element,
						root: resolved.root,
						source: resolved.source,
						unit,
					});
	const importEdit = getImportEdit({ast, imports});
	const output = applyTextEdits(resolved.source, [
		rootEdit,
		...(importEdit ? [importEdit] : []),
	]);

	return {
		...project,
		files: {
			...project.files,
			[resolved.filePath]: output,
		},
	};
};

const relativeToRoot = (filePath: string, rootDir: string) => {
	const normalizedFile = normalizePath(filePath);
	const normalizedRoot = normalizePath(rootDir).replace(/\/$/, '');
	if (normalizedFile.startsWith(`${normalizedRoot}/`)) {
		return normalizedFile.slice(normalizedRoot.length + 1);
	}

	return normalizedFile.replace(/^\//, '');
};

const componentInfo = ({
	project,
	request,
}: {
	project: VirtualProject;
	request: CompositionComponentInfoRequest;
}) => {
	const resolved = resolveCompositionComponent({
		compositionFile: request.compositionFile,
		compositionId: request.compositionId,
		project,
	});

	return {
		canAddSequence: resolved.canAddSequence,
		location: {
			source: relativeToRoot(resolved.filePath, project.rootDir),
			line: resolved.declaration.loc?.start.line ?? 1,
			column: resolved.declaration.loc?.start.column ?? 0,
		},
	};
};

const getCompositionFile = ({
	compositionId,
	project,
}: {
	compositionId: string;
	project: VirtualProject;
}) => {
	for (const [filePath, source] of Object.entries(project.files)) {
		if (typeof source !== 'string') {
			continue;
		}

		try {
			const ast = parseSource(source);
			if (findCompositionElement({ast, compositionId})) {
				return relativeToRoot(filePath, project.rootDir);
			}
		} catch {
			// Ignore files that are not parseable source modules.
		}
	}

	return null;
};

export const createBrowserStudioServer = ({
	getProject,
	onProjectChange,
}: {
	getProject: () => VirtualProject;
	onProjectChange: (project: VirtualProject) => void;
}): BrowserStudioServer => {
	const callApi = ((endpoint: keyof ApiRoutes, body: unknown) => {
		if (endpoint === '/api/composition-component-info') {
			return Promise.resolve(
				componentInfo({
					project: getProject(),
					request: body as CompositionComponentInfoRequest,
				}),
			);
		}

		if (endpoint === '/api/insert-jsx-element') {
			try {
				const project = insertSolidIntoProject({
					project: getProject(),
					request: body as InsertJsxElementRequest,
				});
				onProjectChange(project);
				return Promise.resolve({
					success: true,
				} satisfies InsertJsxElementResponse);
			} catch (error) {
				return Promise.resolve({
					success: false,
					reason: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? (error.stack ?? '') : '',
				} satisfies InsertJsxElementResponse);
			}
		}

		return Promise.reject(
			new Error(`The Browser Studio does not implement ${String(endpoint)}`),
		);
	}) as BrowserStudioServer['callApi'];

	return {
		callApi,
		capabilities: {
			insertSolid: true,
		},
		getCompositionFile: (compositionId) =>
			getCompositionFile({compositionId, project: getProject()}),
	};
};
