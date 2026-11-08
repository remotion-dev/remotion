import type {Node} from '@babel/types';

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

const visitNodes = (value: unknown, visitor: (node: Node) => void) => {
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

	visitor(value as Node);
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

const getDynamicImportPath = (node: Node): string | null => {
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

	return key.type === 'StringLiteral' ? key.value : null;
};

// `lazyComponent` must resolve to a module whose `default` is the component.
// Find out which export of the dynamically imported file ends up there:
// - `() => import('./Comp')` -> `default`
// - `async () => { const {Comp} = await import('./Comp'); return {default: Comp}; }` -> `Comp`
// - `() => import('./Comp').then((m) => ({default: m.Comp}))` -> `Comp`
// Unrecognized shapes fall back to `default`.
export const getLazyComponentImport = (
	lazyComponent: Node,
): LazyComponentImport | null => {
	// Assigned inside callbacks, so prevent TypeScript from narrowing to `null`.
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

	let defaultValue = null as Node | null;
	visitNodes(lazyComponent, (node) => {
		if (
			node.type === 'VariableDeclarator' &&
			unwrapExpression(node.init) === importCall
		) {
			bindModule(node.id);
		}

		if (
			node.type === 'CallExpression' &&
			node.callee.type === 'MemberExpression' &&
			unwrapExpression(node.callee.object) === importCall &&
			getStaticKeyName(node.callee.property, node.callee.computed) === 'then'
		) {
			const callback = node.arguments[0];
			if (
				callback?.type === 'ArrowFunctionExpression' ||
				callback?.type === 'FunctionExpression'
			) {
				bindModule(callback.params[0]);
			}
		}

		if (node.type === 'ObjectExpression' && defaultValue === null) {
			for (const property of node.properties) {
				if (
					property.type === 'ObjectProperty' &&
					getStaticKeyName(property.key, property.computed) === 'default'
				) {
					defaultValue = property.value;
				}
			}
		}
	});

	const value = unwrapExpression(defaultValue);
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

	return {importPath, exportName: 'default'};
};
