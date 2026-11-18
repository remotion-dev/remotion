import type {Node, ObjectExpression} from '@babel/types';

// Keep this file browser-safe: it is shared with the Recast-free composition
// component resolver.

export type LazyComponentImport = {
	importPath: string;
	exportName: string | 'default';
};

const IGNORED_KEYS = new Set([
	'loc',
	'start',
	'end',
	'extra',
	'comments',
	'leadingComments',
	'trailingComments',
	'innerComments',
	'original',
]);

// Return `false` from the visitor to skip a node's children.
const visitNodes = (
	value: unknown,
	visitor: (node: Node) => boolean | void,
) => {
	if (Array.isArray(value)) {
		for (const item of value) {
			visitNodes(item, visitor);
		}

		return;
	}

	if (
		typeof value !== 'object' ||
		value === null ||
		!('type' in value) ||
		typeof value.type !== 'string'
	) {
		return;
	}

	if (visitor(value as Node) === false) {
		return;
	}

	for (const [key, child] of Object.entries(value)) {
		if (!IGNORED_KEYS.has(key)) {
			visitNodes(child, visitor);
		}
	}
};

const unwrapExpression = (node: Node | null | undefined): Node | null => {
	let current = node ?? null;
	while (current) {
		if (current.type === 'AwaitExpression') {
			current = current.argument;
		} else if (
			current.type === 'ParenthesizedExpression' ||
			current.type === 'TSAsExpression' ||
			current.type === 'TSSatisfiesExpression' ||
			current.type === 'TSNonNullExpression' ||
			current.type === 'TypeCastExpression'
		) {
			current = current.expression;
		} else {
			return current;
		}
	}

	return null;
};

export const getDynamicImportPath = (node: Node): string | null => {
	if (
		node.type === 'ImportExpression' &&
		node.source.type === 'StringLiteral'
	) {
		return node.source.value;
	}

	if (
		node.type === 'CallExpression' &&
		node.callee.type === 'Import' &&
		node.arguments[0]?.type === 'StringLiteral'
	) {
		return node.arguments[0].value;
	}

	return null;
};

const getStaticKeyName = (key: Node, computed: boolean): string | null => {
	if (!computed && key.type === 'Identifier') {
		return key.name;
	}

	if (key.type === 'NumericLiteral') {
		return String(key.value);
	}

	return key.type === 'StringLiteral' ? key.value : null;
};

type LoaderFunction = Extract<
	Node,
	{type: 'ArrowFunctionExpression' | 'FunctionExpression'}
>;

const isLoaderFunction = (node: Node | null): node is LoaderFunction => {
	return (
		node?.type === 'ArrowFunctionExpression' ||
		node?.type === 'FunctionExpression'
	);
};

const NESTED_FUNCTION_TYPES = new Set([
	'ArrowFunctionExpression',
	'FunctionExpression',
	'FunctionDeclaration',
	'ObjectMethod',
	'ClassMethod',
	'ClassPrivateMethod',
]);

// The value a function returns, if it has exactly one `return` with a value.
// Returns of nested functions are ignored.
const getReturnedExpression = (fn: LoaderFunction): Node | null => {
	if (fn.body.type !== 'BlockStatement') {
		return unwrapExpression(fn.body);
	}

	const returned: Array<Node | null> = [];
	visitNodes(fn.body.body, (node) => {
		if (node.type === 'ReturnStatement') {
			returned.push(node.argument ?? null);
		}

		return !NESTED_FUNCTION_TYPES.has(node.type);
	});

	return returned.length === 1 ? unwrapExpression(returned[0]) : null;
};

// `lazyComponent` must resolve to a module whose `default` is the component.
// Find out which export of the dynamically imported file ends up there:
// - `() => import('./Comp')` -> `default`
// - `async () => { const {Comp} = await import('./Comp'); return {default: Comp}; }` -> `Comp`
// - `() => import('./Comp').then((m) => ({default: m.Comp}))` -> `Comp`
// Only the value the loader returns is considered. Shapes that cannot be
// resolved with confidence fall back to `default`.
export const getLazyComponentImport = (
	lazyComponent: Node,
): LazyComponentImport | null => {
	// Assigned inside a callback, so prevent TypeScript from narrowing to `null`.
	let importCall = null as Node | null;
	let importPath = null as string | null;
	visitNodes(lazyComponent, (node) => {
		if (importCall === null) {
			importPath = getDynamicImportPath(node);
			importCall = importPath === null ? null : node;
		}
	});
	if (importCall === null || importPath === null) {
		return null;
	}

	const fallback: LazyComponentImport = {importPath, exportName: 'default'};
	const loader = unwrapExpression(lazyComponent);
	if (!isLoaderFunction(loader)) {
		return fallback;
	}

	const moduleBindings = new Set<string>();
	const destructuredExports = new Map<string, string>();
	const bindModule = (binding: Node | null | undefined) => {
		if (binding?.type === 'Identifier') {
			moduleBindings.add(binding.name);
			return;
		}

		if (binding?.type !== 'ObjectPattern') {
			return;
		}

		for (const property of binding.properties) {
			if (property.type !== 'ObjectProperty') {
				continue;
			}

			const exportName = getStaticKeyName(property.key, property.computed);
			const local =
				property.value.type === 'AssignmentPattern'
					? property.value.left
					: property.value;
			if (exportName !== null && local.type === 'Identifier') {
				destructuredExports.set(local.name, exportName);
			}
		}
	};

	visitNodes(loader.body, (node) => {
		if (
			node.type === 'VariableDeclarator' &&
			unwrapExpression(node.init) === importCall
		) {
			bindModule(node.id);
		}
	});

	let moduleValue = getReturnedExpression(loader);
	// `import('./Comp').then((m) => ...)` resolves to what the callback returns.
	if (
		moduleValue?.type === 'CallExpression' &&
		moduleValue.callee.type === 'MemberExpression' &&
		unwrapExpression(moduleValue.callee.object) === importCall &&
		getStaticKeyName(
			moduleValue.callee.property,
			moduleValue.callee.computed,
		) === 'then'
	) {
		const callback = unwrapExpression(moduleValue.arguments[0]);
		if (!isLoaderFunction(callback)) {
			return fallback;
		}

		bindModule(callback.params[0]);
		moduleValue = getReturnedExpression(callback);
	}

	// Returning the imported module itself keeps its `default` export.
	if (moduleValue?.type !== 'ObjectExpression') {
		return fallback;
	}

	// The last property that may define `default` wins. If that is a spread, a
	// method or a computed key, the component cannot be determined.
	let lastDefaultCandidate: ObjectExpression['properties'][number] | null =
		null;
	for (const property of moduleValue.properties) {
		const keyName =
			property.type === 'SpreadElement'
				? null
				: getStaticKeyName(property.key, property.computed);
		if (keyName === null || keyName === 'default') {
			lastDefaultCandidate = property;
		}
	}

	if (lastDefaultCandidate?.type !== 'ObjectProperty') {
		return fallback;
	}

	const value = unwrapExpression(lastDefaultCandidate.value);
	if (
		value?.type === 'MemberExpression' ||
		value?.type === 'OptionalMemberExpression'
	) {
		const object = unwrapExpression(value.object);
		const exportName = getStaticKeyName(value.property, value.computed);
		if (
			exportName !== null &&
			(object === importCall ||
				(object?.type === 'Identifier' && moduleBindings.has(object.name)))
		) {
			return {importPath, exportName};
		}
	}

	if (value?.type === 'Identifier') {
		const exportName = destructuredExports.get(value.name);
		if (exportName !== undefined) {
			return {importPath, exportName};
		}
	}

	return fallback;
};
