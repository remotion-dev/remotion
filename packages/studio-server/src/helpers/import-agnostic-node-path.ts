import type {File, Node} from '@babel/types';
import type {SequenceNodePath} from 'remotion';

type ArrayContext = {
	parent: Node;
	property: string;
};

type IgnoredNodePredicate = (node: Node, context: ArrayContext) => boolean;

const getActualIndex = ({
	items,
	agnosticIndex,
	shouldIgnore,
	context,
}: {
	items: Node[];
	agnosticIndex: number;
	shouldIgnore: IgnoredNodePredicate;
	context: ArrayContext;
}): number | null => {
	let seenIncludedNodes = 0;
	for (let i = 0; i < items.length; i++) {
		if (shouldIgnore(items[i], context)) {
			continue;
		}

		if (seenIncludedNodes === agnosticIndex) {
			return i;
		}

		seenIncludedNodes++;
	}

	return null;
};

const getAgnosticIndex = ({
	items,
	actualIndex,
	shouldIgnore,
	context,
}: {
	items: Node[];
	actualIndex: number;
	shouldIgnore: IgnoredNodePredicate;
	context: ArrayContext;
}): number | null => {
	if (actualIndex < 0 || actualIndex >= items.length) {
		return null;
	}

	let seenIncludedNodes = 0;
	for (let i = 0; i <= actualIndex; i++) {
		if (shouldIgnore(items[i], context)) {
			continue;
		}

		if (i === actualIndex) {
			return seenIncludedNodes;
		}

		seenIncludedNodes++;
	}

	return null;
};

const getUseCurrentFrameLocalNames = (ast: File): Set<string> => {
	const names = new Set(['useCurrentFrame']);
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
				specifier.imported.type === 'Identifier' &&
				specifier.imported.name === 'useCurrentFrame'
			) {
				names.add(specifier.local?.name ?? 'useCurrentFrame');
			}
		}
	}

	return names;
};

const getGoogleFontLoadFontLocalNames = (ast: File): Set<string> => {
	const names = new Set<string>();
	for (const statement of ast.program.body) {
		if (
			statement.type !== 'ImportDeclaration' ||
			typeof statement.source.value !== 'string' ||
			!statement.source.value.startsWith('@remotion/google-fonts/')
		) {
			continue;
		}

		for (const specifier of statement.specifiers) {
			if (
				specifier.type === 'ImportSpecifier' &&
				specifier.imported.type === 'Identifier' &&
				specifier.imported.name === 'loadFont'
			) {
				names.add(specifier.local?.name ?? 'loadFont');
			}
		}
	}

	return names;
};

const isUseCurrentFrameCall = (
	node: Node | null | undefined,
	useCurrentFrameLocalNames: ReadonlySet<string>,
): boolean => {
	return (
		node?.type === 'CallExpression' &&
		node.callee.type === 'Identifier' &&
		useCurrentFrameLocalNames.has(node.callee.name)
	);
};

const isUseCurrentFrameStatement = (
	node: Node,
	useCurrentFrameLocalNames: ReadonlySet<string>,
): boolean => {
	if (node.type === 'ExpressionStatement') {
		return isUseCurrentFrameCall(node.expression, useCurrentFrameLocalNames);
	}

	if (node.type !== 'VariableDeclaration' || node.declarations.length !== 1) {
		return false;
	}

	return isUseCurrentFrameCall(
		node.declarations[0].init,
		useCurrentFrameLocalNames,
	);
};

const isGoogleFontLoadFontStatement = (
	node: Node,
	googleFontLoadFontLocalNames: ReadonlySet<string>,
): boolean => {
	return (
		node.type === 'ExpressionStatement' &&
		node.expression.type === 'CallExpression' &&
		node.expression.callee.type === 'Identifier' &&
		googleFontLoadFontLocalNames.has(node.expression.callee.name)
	);
};

const getIgnoredNodePredicate = (ast: File): IgnoredNodePredicate => {
	const useCurrentFrameLocalNames = getUseCurrentFrameLocalNames(ast);
	const googleFontLoadFontLocalNames = getGoogleFontLoadFontLocalNames(ast);
	return (node, {parent, property}) => {
		if (parent.type === 'Program' && property === 'body') {
			return (
				node.type === 'ImportDeclaration' ||
				isGoogleFontLoadFontStatement(node, googleFontLoadFontLocalNames)
			);
		}

		if (parent.type === 'BlockStatement' && property === 'body') {
			return isUseCurrentFrameStatement(node, useCurrentFrameLocalNames);
		}

		return false;
	};
};

const getChild = (value: unknown, segment: string | number): unknown => {
	if (value === null || value === undefined) {
		return null;
	}

	if (Array.isArray(value)) {
		return value[segment as number] ?? null;
	}

	if (typeof value !== 'object') {
		return null;
	}

	return (value as Record<string, unknown>)[segment] ?? null;
};

const transformNodePathIndices = ({
	ast,
	nodePath,
	direction,
}: {
	ast: File;
	nodePath: SequenceNodePath;
	direction: 'to-agnostic' | 'from-agnostic';
}): SequenceNodePath | null => {
	const shouldIgnore = getIgnoredNodePredicate(ast);
	const transformed: SequenceNodePath = [];
	let current: unknown = ast;
	let arrayContext: ArrayContext | null = null;

	for (const segment of nodePath) {
		if (typeof segment === 'string') {
			const parent = current;
			current = getChild(current, segment);
			if (
				Array.isArray(current) &&
				parent &&
				typeof parent === 'object' &&
				'type' in parent
			) {
				arrayContext = {parent: parent as Node, property: segment};
			} else {
				arrayContext = null;
			}

			transformed.push(segment);
			continue;
		}

		if (!Array.isArray(current) || !arrayContext) {
			current = getChild(current, segment);
			transformed.push(segment);
			continue;
		}

		const mappedIndex =
			direction === 'to-agnostic'
				? getAgnosticIndex({
						items: current as Node[],
						actualIndex: segment,
						shouldIgnore,
						context: arrayContext,
					})
				: getActualIndex({
						items: current as Node[],
						agnosticIndex: segment,
						shouldIgnore,
						context: arrayContext,
					});
		if (mappedIndex === null) {
			if (direction === 'from-agnostic') {
				return null;
			}

			current = getChild(current, segment);
			transformed.push(segment);
			continue;
		}

		current = getChild(
			current,
			direction === 'to-agnostic' ? segment : mappedIndex,
		);
		arrayContext = null;
		transformed.push(mappedIndex);
	}

	return transformed;
};

export const toImportAgnosticNodePath = ({
	ast,
	nodePath,
}: {
	ast: File;
	nodePath: SequenceNodePath;
}): SequenceNodePath => {
	return (
		transformNodePathIndices({ast, nodePath, direction: 'to-agnostic'}) ??
		nodePath
	);
};

export const fromImportAgnosticNodePath = ({
	ast,
	nodePath,
}: {
	ast: File;
	nodePath: SequenceNodePath;
}): SequenceNodePath | null => {
	return transformNodePathIndices({ast, nodePath, direction: 'from-agnostic'});
};
