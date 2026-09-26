import {parse} from '@babel/parser';
import type {
	CanUpdateDefaultPropsResponse,
	CompositionComponentInfoRequest,
} from '@remotion/studio-shared';
import type {CodemodProject} from './codemod-project';
import {resolveCompositionComponentInProject} from './resolve-composition-component-location';

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

export const findProjectFile = ({
	filePath,
	project,
}: {
	filePath: string;
	project: CodemodProject;
}) => {
	const normalizedInput = normalizePath(stripSourceProtocol(filePath));
	const rootDir = normalizePath(project.rootDir);
	const candidates = [
		normalizedInput,
		...(normalizedInput.startsWith(`${rootDir}/`)
			? [normalizedInput.slice(rootDir.length + 1)]
			: []),
		normalizePath(normalizedInput.replace(/^\/+/, '')),
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
	project: CodemodProject;
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

const relativeToRoot = (filePath: string, rootDir: string) => {
	const normalizedFile = normalizePath(filePath);
	const normalizedRoot = normalizePath(rootDir).replace(/\/$/, '');
	if (normalizedFile.startsWith(`${normalizedRoot}/`)) {
		return normalizedFile.slice(normalizedRoot.length + 1);
	}

	return normalizedFile.replace(/^\//, '');
};

export const getCompositionComponentInfo = ({
	project,
	request,
}: {
	project: CodemodProject;
	request: CompositionComponentInfoRequest;
}) => {
	const resolved = resolveCompositionComponentInProject({
		compositionFile: request.compositionFile,
		compositionId: request.compositionId,
		project,
	});

	return {
		canAddSequence: resolved.canAddSequence,
		location: resolved.location,
	};
};

export const getCompositionFile = ({
	compositionId,
	project,
}: {
	compositionId: string;
	project: CodemodProject;
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

export const getFolderFile = ({
	folderName,
	project,
}: {
	folderName: string;
	project: CodemodProject;
}) => {
	for (const [filePath, source] of Object.entries(project.files)) {
		if (typeof source !== 'string') {
			continue;
		}

		try {
			const ast = parseSource(source);
			let found = false;
			visit(ast, (node) => {
				if (node.type !== 'JSXElement') {
					return false;
				}

				const openingElement = getNode(node, 'openingElement');
				if (
					!openingElement ||
					jsxName(getNode(openingElement, 'name')) !== 'Folder'
				) {
					return false;
				}

				if (
					jsxAttributeString(getJsxAttribute(openingElement, 'name')) !==
					folderName
				) {
					return false;
				}

				found = true;
				return true;
			});
			if (found) {
				return relativeToRoot(filePath, project.rootDir);
			}
		} catch {
			// Ignore files that are not parseable source modules.
		}
	}

	return null;
};

export const getRootFileForProject = ({
	entryPoint,
	project,
}: {
	entryPoint: string;
	project: CodemodProject;
}): string | null => {
	let entryFile: string;
	try {
		entryFile = findProjectFile({filePath: entryPoint, project});
	} catch {
		return null;
	}

	try {
		const ast = parseSource(project.files[entryFile]);
		let rootComponentName: string | null = null;
		visit(ast, (node) => {
			if (node.type !== 'CallExpression') {
				return false;
			}

			const callee = getNode(node, 'callee');
			if (
				callee?.type !== 'Identifier' ||
				getString(callee, 'name') !== 'registerRoot'
			) {
				return false;
			}

			const [argument] = getNodes(node, 'arguments');
			if (argument?.type === 'Identifier') {
				rootComponentName = getString(argument, 'name');
			}

			return true;
		});
		if (rootComponentName === null) {
			return null;
		}

		let importPath: string | null = null;
		visit(ast, (node) => {
			if (node.type !== 'ImportDeclaration') {
				return false;
			}

			for (const specifier of getNodes(node, 'specifiers')) {
				const local = getNode(specifier, 'local');
				if (local && getString(local, 'name') === rootComponentName) {
					importPath = getString(getNode(node, 'source'), 'value');
					return true;
				}
			}

			return false;
		});
		if (importPath === null) {
			// The root component is defined in the entry file itself.
			return relativeToRoot(entryFile, project.rootDir);
		}

		return relativeToRoot(
			resolveImportFile({fromFile: entryFile, importPath, project}),
			project.rootDir,
		);
	} catch {
		return null;
	}
};

const staticFileToken = 'remotion-file:';
const dateToken = 'remotion-date:';

type ExtractedStaticValue = {success: true; value: unknown} | {success: false};

const extractSpecialDefaultPropValue = (
	node: AstNode,
): ExtractedStaticValue | null => {
	if (node.type === 'CallExpression') {
		const callee = getNode(node, 'callee');
		const args = getNodes(node, 'arguments');
		if (
			callee?.type === 'Identifier' &&
			getString(callee, 'name') === 'staticFile' &&
			args.length === 1 &&
			args[0].type === 'StringLiteral'
		) {
			const value = getString(args[0], 'value');
			if (value !== null) {
				return {
					success: true,
					value: `${staticFileToken}${value
						.split('/')
						.map(encodeURIComponent)
						.join('/')}`,
				};
			}
		}

		return {success: false};
	}

	if (node.type === 'NewExpression') {
		const callee = getNode(node, 'callee');
		const args = getNodes(node, 'arguments');
		if (
			callee?.type === 'Identifier' &&
			getString(callee, 'name') === 'Date' &&
			args.length === 1 &&
			args[0].type === 'StringLiteral'
		) {
			const value = getString(args[0], 'value');
			if (value !== null) {
				return {success: true, value: `${dateToken}${value}`};
			}
		}

		return {success: false};
	}

	return null;
};

const extractStaticDefaultPropValue = (node: AstNode): ExtractedStaticValue => {
	const special = extractSpecialDefaultPropValue(node);
	if (special !== null) {
		return special;
	}

	switch (node.type) {
		case 'NumericLiteral':
		case 'StringLiteral':
		case 'BooleanLiteral':
			return {success: true, value: node.value};
		case 'NullLiteral':
			return {success: true, value: null};
		case 'UnaryExpression': {
			const argument = getNode(node, 'argument');
			const operator = getString(node, 'operator');
			if (
				argument?.type === 'NumericLiteral' &&
				typeof argument.value === 'number' &&
				(operator === '-' || operator === '+')
			) {
				return {
					success: true,
					value: operator === '-' ? -argument.value : argument.value,
				};
			}

			return {success: false};
		}

		case 'TSAsExpression': {
			const expression = getNode(node, 'expression');
			return expression
				? extractStaticDefaultPropValue(expression)
				: {success: false};
		}

		case 'ArrayExpression': {
			const {elements} = node;
			if (!Array.isArray(elements)) {
				return {success: false};
			}

			const values: unknown[] = [];
			for (const element of elements) {
				if (!isAstNode(element) || element.type === 'SpreadElement') {
					return {success: false};
				}

				const extracted = extractStaticDefaultPropValue(element);
				if (!extracted.success) {
					return extracted;
				}

				values.push(extracted.value);
			}

			return {success: true, value: values};
		}

		case 'ObjectExpression': {
			const result: Record<string, unknown> = {};
			for (const property of getNodes(node, 'properties')) {
				if (property.type !== 'ObjectProperty') {
					return {success: false};
				}

				const value = getNode(property, 'value');
				if (!value) {
					return {success: false};
				}

				const extracted = extractStaticDefaultPropValue(value);
				if (!extracted.success) {
					return extracted;
				}

				const key = getNode(property, 'key');
				const propertyName =
					key?.type === 'Identifier'
						? getString(key, 'name')
						: key?.type === 'StringLiteral' || key?.type === 'NumericLiteral'
							? String(key.value)
							: null;
				if (propertyName !== null) {
					result[propertyName] = extracted.value;
				}
			}

			return {success: true, value: result};
		}

		default:
			return {success: false};
	}
};

export const computeCanUpdateDefaultPropsFromContent = (
	content: string,
	compositionId: string,
): CanUpdateDefaultPropsResponse => {
	try {
		const ast = parseSource(content);
		const composition = findCompositionElement({ast, compositionId});
		const defaultProps = composition
			? getJsxAttribute(composition, 'defaultProps')
			: null;
		const value = defaultProps ? getNode(defaultProps, 'value') : null;
		const expression =
			value?.type === 'JSXExpressionContainer'
				? getNode(value, 'expression')
				: null;
		const extracted = expression
			? extractStaticDefaultPropValue(expression)
			: {success: false as const};

		if (
			!extracted.success ||
			extracted.value === null ||
			typeof extracted.value !== 'object' ||
			Array.isArray(extracted.value)
		) {
			throw new Error(
				`Could not find or extract defaultProps for composition "${compositionId}"`,
			);
		}

		return {
			canUpdate: true,
			currentDefaultProps: extracted.value as Record<string, unknown>,
		};
	} catch (error) {
		return {
			canUpdate: false,
			reason: error instanceof Error ? error.message : String(error),
		};
	}
};

export const getCanUpdateDefaultPropsForProject = ({
	compositionId,
	project,
}: {
	compositionId: string;
	project: CodemodProject;
}): CanUpdateDefaultPropsResponse => {
	const compositionFile = getCompositionFile({compositionId, project});
	if (compositionFile === null) {
		return {canUpdate: false, reason: 'Cannot find root file in project'};
	}

	if (
		!compositionFile.endsWith('.tsx') &&
		!compositionFile.endsWith('.ts') &&
		!compositionFile.endsWith('.mtsx') &&
		!compositionFile.endsWith('.mts')
	) {
		return {
			canUpdate: false,
			reason: 'Cannot update Root file if not using TypeScript',
		};
	}

	const filePath = findProjectFile({filePath: compositionFile, project});
	return computeCanUpdateDefaultPropsFromContent(
		project.files[filePath],
		compositionId,
	);
};
