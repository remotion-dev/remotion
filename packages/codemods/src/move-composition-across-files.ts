import {
	cloneNode,
	isReferenced,
	stringLiteral,
	type File,
	type Identifier,
	type ImportDeclaration,
	type JSXIdentifier,
	type Node,
} from '@babel/types';
import * as recast from 'recast';
import type {CodemodProject} from './codemod-project';
import {getNodeSourceEdit} from './delete-jsx-nodes-internal';
import {
	getTreeEntries,
	requireTreeItem,
	type TreeEntry,
} from './folder-editing';
import {
	captureJsxNodePaths,
	collectJsxSubtree,
	requireCapturedNodePath,
} from './get-node-path-remappings';
import {getInsertionRootSourceEdit} from './insert-jsx-element';
import {dirname, normalizePath} from './internals';
import {
	getNodeEditResult,
	getSubtreeEditRemappings,
	type NodeReference,
} from './node-references';
import {recastLocToOffset} from './recast-loc-to-offset';
import {
	getImportedName,
	insertImportDeclaration,
} from './sequence-props/imports';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getAdjacentJsxInsertionSourceEdit,
	getInsertImportSourceEdits,
	getJsxElementSourceForInsertion,
	type SourceEdit,
} from './source-edits';
import {removeUnusedImports} from './unused-imports';

// These references are portable only when they are not lexically shadowed at
// either location. Unknown globals and module-relative expressions fail closed.
const portableGlobals = new Set([
	'undefined',
	'NaN',
	'Infinity',
	'Math',
	'JSON',
	'Object',
	'Array',
	'String',
	'Number',
	'Boolean',
	'BigInt',
	'Date',
	'RegExp',
	'Promise',
	'Map',
	'Set',
	'WeakMap',
	'WeakSet',
	'Symbol',
	'Intl',
	'globalThis',
	'console',
]);

const rebaseImport = (
	specifier: string,
	sourceFile: string,
	targetFile: string,
) => {
	if (specifier.startsWith('@/') || specifier.startsWith('~/')) {
		throw new Error(
			`Cannot move a registration using the unresolved import alias "${specifier}"`,
		);
	}

	if (!specifier.startsWith('.')) return specifier;
	const resolved = normalizePath(`${dirname(sourceFile)}/${specifier}`);
	const target = normalizePath(targetFile);
	if (
		[
			resolved,
			...['.tsx', '.ts', '.jsx', '.js'].flatMap((extension) => [
				resolved + extension,
				`${resolved}/index${extension}`,
			]),
		].some(
			(candidate) =>
				candidate.replace(/^\/+/, '') === target.replace(/^\/+/, ''),
		)
	) {
		throw new Error(
			`Cannot move a registration that imports from its destination file (${specifier})`,
		);
	}

	const from = normalizePath(dirname(targetFile)).split('/').filter(Boolean);
	const to = resolved.split('/').filter(Boolean);
	if (
		/^[A-Za-z]:$/.test(from[0]) &&
		from[0].toLowerCase() !== to[0]?.toLowerCase()
	) {
		throw new Error(
			'Cannot move registrations between different filesystem drives',
		);
	}

	let common = 0;
	while (
		common < from.length &&
		common < to.length &&
		from[common] === to[common]
	)
		common++;
	const relative = [
		...from.slice(common).map(() => '..'),
		...to.slice(common),
	].join('/');
	return relative.startsWith('.') ? relative : `./${relative}`;
};

export const moveCompositionAcrossFiles = ({
	project,
	sourceFile,
	sourceAst,
	source,
	targetFile,
	targetAst,
	target,
	position,
}: {
	project: CodemodProject;
	sourceFile: string;
	sourceAst: File;
	source: TreeEntry;
	targetFile: string;
	targetAst: File;
	target: TreeEntry;
	position: 'folder' | 'before' | 'after';
}) => {
	const input = project.files[sourceFile];
	const targetInput = project.files[targetFile];
	const sourceBefore = captureJsxNodePaths(sourceAst);
	const targetBefore = captureJsxNodePaths(targetAst);
	const snapshots = captureImportSnapshots(targetAst);
	const subtreeNodes = new Set<unknown>();
	const subtreeNames = new Set<string>();
	const occupiedNames = new Set<string>();
	recast.visit(source.node, {
		visitNode(path) {
			subtreeNodes.add(path.node);
			const node = path.node as Node;
			if (node.type === 'Identifier' || node.type === 'JSXIdentifier')
				subtreeNames.add(node.name);
			return this.traverse(path);
		},
	});
	recast.visit(targetAst, {
		visitNode(path) {
			const node = path.node as Node;
			if (node.type === 'Identifier' || node.type === 'JSXIdentifier')
				occupiedNames.add(node.name);
			return this.traverse(path);
		},
	});
	const imports = sourceAst.program.body.filter(
		(statement): statement is ImportDeclaration =>
			statement.type === 'ImportDeclaration',
	);
	const migrated = new Map<string, string>();
	const sourceEdits: SourceEdit[] = [];
	const readReference = (path: recast.types.NodePath) => {
		const node = path.node as Identifier | JSXIdentifier;
		const parent = path.parent.node as Node;
		if (!isReferenced(node, parent)) return;
		if (
			(parent.type === 'TSQualifiedName' && parent.right === node) ||
			((parent.type === 'TSPropertySignature' ||
				parent.type === 'TSMethodSignature') &&
				!parent.computed &&
				parent.key === node) ||
			(parent.type === 'TSNamedTupleMember' && parent.label === node)
		)
			return;
		if (
			node.type === 'JSXIdentifier' &&
			/^[a-z]/.test(node.name) &&
			(parent.type === 'JSXOpeningElement' ||
				parent.type === 'JSXClosingElement')
		)
			return;
		const bindingScope = path.scope.lookup(node.name);
		const bindings = (bindingScope?.getBindings()[node.name] ??
			[]) as recast.types.NodePath[];
		if (
			bindings.length > 0 &&
			bindings.every((binding) => subtreeNodes.has(binding.node))
		)
			return;
		const declaration = imports.find((candidate) =>
			candidate.specifiers.some((importSpecifier) =>
				bindings.some((binding) => binding.node === importSpecifier.local),
			),
		);
		const specifier = declaration?.specifiers.find((candidate) =>
			bindings.some((binding) => binding.node === candidate.local),
		);
		if (!declaration || !specifier) {
			if (
				bindings.length === 0 &&
				portableGlobals.has(node.name) &&
				!target.path.scope.lookup(node.name)
			)
				return;
			throw new Error(
				`Cannot move registration: dependency "${node.name}" is local or unresolved. Move it into an imported module first.`,
			);
		}

		let localName = migrated.get(node.name);
		if (localName === undefined) {
			if (
				(declaration.assertions?.length ?? 0) > 0 ||
				(declaration.attributes?.length ?? 0) > 0 ||
				(specifier.type === 'ImportSpecifier' &&
					specifier.imported.type !== 'Identifier')
			) {
				throw new Error(
					`Cannot move registration with import attributes or a string-named import (${node.name})`,
				);
			}

			const importPath = rebaseImport(
				declaration.source.value,
				sourceFile,
				targetFile,
			);
			const existing = targetAst.program.body.flatMap((statement) => {
				if (
					statement.type !== 'ImportDeclaration' ||
					statement.source.value !== importPath ||
					(statement.importKind ?? 'value') !==
						(declaration.importKind ?? 'value')
				)
					return [];
				return statement.specifiers.filter((candidate) => {
					if (candidate.type !== specifier.type) return false;
					if (
						candidate.type === 'ImportSpecifier' &&
						specifier.type === 'ImportSpecifier' &&
						(getImportedName(candidate) !== getImportedName(specifier) ||
							(candidate.importKind ?? 'value') !==
								(specifier.importKind ?? 'value'))
					)
						return false;
					const candidateName = candidate.local.name;
					if (candidateName !== node.name && subtreeNames.has(candidateName))
						return false;
					const destinationBindings = (target.path.scope
						.lookup(candidateName)
						?.getBindings()[candidateName] ?? []) as recast.types.NodePath[];
					return (
						destinationBindings.length > 0 &&
						destinationBindings.every(
							(binding) => binding.node === candidate.local,
						)
					);
				});
			})[0];
			if (existing) {
				localName = existing.local.name;
			} else {
				localName = node.name;
				let suffix = 2;
				while (
					occupiedNames.has(localName) ||
					(localName !== node.name && subtreeNames.has(localName))
				)
					localName = `${node.name}${suffix++}`;
				occupiedNames.add(localName);
				const copied = cloneNode(specifier);
				copied.local = {type: 'Identifier', name: localName};
				insertImportDeclaration(targetAst, {
					type: 'ImportDeclaration',
					source: {type: 'StringLiteral', value: importPath},
					specifiers: [copied],
					importKind: declaration.importKind,
				});
			}

			migrated.set(node.name, localName);
		}

		if (localName === node.name) return;
		if (!node.loc)
			throw new Error(`Could not locate dependency "${node.name}"`);
		sourceEdits.push({
			start: recastLocToOffset(input, node.loc.start),
			end: recastLocToOffset(input, node.loc.end),
			replacement:
				parent.type === 'ObjectProperty' &&
				parent.shorthand &&
				parent.value === node
					? `${node.name}: ${localName}`
					: localName,
		});
	};

	recast.visit(source.path as never, {
		visitIdentifier(path) {
			readReference(path);
			return this.traverse(path);
		},
		visitJSXIdentifier(path) {
			readReference(path);
			return this.traverse(path);
		},
		visitThisExpression() {
			throw new Error(
				'Cannot move registration with a lexical this dependency',
			);
		},
		visitSuper() {
			throw new Error('Cannot move registration with a super dependency');
		},
		visitMetaProperty() {
			throw new Error('Cannot move registration with module-relative metadata');
		},
		visitAwaitExpression() {
			throw new Error('Cannot move registration containing await');
		},
		visitYieldExpression() {
			throw new Error('Cannot move registration containing yield');
		},
		visitCallExpression(path) {
			if (path.node.callee.type === 'Import') {
				const argument = path.node.arguments[0];
				if (!argument || argument.type !== 'StringLiteral' || !argument.loc)
					throw new Error(
						'Cannot move a registration with a dynamic import path',
					);
				const quote =
					input[recastLocToOffset(input, argument.loc.start)] === "'"
						? 'single'
						: 'double';
				sourceEdits.push({
					start: recastLocToOffset(input, argument.loc.start),
					end: recastLocToOffset(input, argument.loc.end),
					replacement: recast.prettyPrint(
						stringLiteral(rebaseImport(argument.value, sourceFile, targetFile)),
						{quote},
					).code,
				});
			}

			return this.traverse(path);
		},
	});
	// Rewrite only resolved references in the copied subtree, preserving object
	// keys, literal values and the formatting of all other source code.
	const rewritten = applySourceEdits({input, edits: sourceEdits});
	const rewrittenAst = parseAst(rewritten);
	// The copied tag may now use an alias imported only in the destination.
	// Its original starting location is unchanged by edits inside the subtree.
	const rewrittenNodes: TreeEntry['node'][] = [];
	recast.visit(rewrittenAst, {
		visitJSXElement(path) {
			if (
				path.node.loc?.start.line === source.node.loc?.start.line &&
				path.node.loc?.start.column === source.node.loc?.start.column
			) {
				rewrittenNodes.push(path.node as TreeEntry['node']);
				return false;
			}

			return this.traverse(path);
		},
	});
	if (rewrittenNodes.length !== 1) {
		throw new Error('Could not locate the rewritten composition registration');
	}

	const insertion = getJsxElementSourceForInsertion({
		element: rewrittenNodes[0],
		input: rewritten,
	});
	const sourceOutput = removeUnusedImports({
		input: applySourceEdits({
			input,
			edits: [getNodeSourceEdit({input, jsxPath: source.path})],
		}),
		localNames: new Set(migrated.keys()),
	});
	const targetOutput = applySourceEdits({
		input: targetInput,
		edits: [
			...getInsertImportSourceEdits({
				ast: targetAst,
				input: targetInput,
				prettierConfigOverride: null,
				snapshots,
			}),
			position === 'folder'
				? getInsertionRootSourceEdit({
						input: targetInput,
						insertion,
						root: target.node as never,
						nullRoot: null,
						prettierConfigOverride: null,
						insertInside: true,
					})
				: getAdjacentJsxInsertionSourceEdit({
						input: targetInput,
						insertion,
						position,
						target: target.node,
					}),
		],
	});
	const nextSourceAst = parseAst(sourceOutput);
	const nextTargetAst = parseAst(targetOutput);
	const sourceAfter = captureJsxNodePaths(nextSourceAst);
	const targetAfter = captureJsxNodePaths(nextTargetAst);
	const moved = requireTreeItem(
		getTreeEntries({ast: nextTargetAst}),
		source.item,
	);
	const updatedNode: NodeReference = {
		filePath: targetFile,
		nodePath: requireCapturedNodePath(targetAfter, moved.node.openingElement),
	};
	return {
		...getNodeEditResult({
			project,
			edits: [
				{
					filePath: sourceFile,
					output: sourceOutput,
					nodePathRemappings: getSubtreeEditRemappings({
						before: sourceBefore,
						after: sourceAfter,
						subtrees: [
							{
								before: collectJsxSubtree(
									sourceBefore,
									source.node.openingElement,
								),
								after: new Set(),
							},
						],
					}),
				},
				{
					filePath: targetFile,
					output: targetOutput,
					nodePathRemappings: getSubtreeEditRemappings({
						before: targetBefore,
						after: targetAfter,
						subtrees: [
							{
								before: new Set(),
								after: collectJsxSubtree(
									targetAfter,
									moved.node.openingElement,
								),
							},
						],
					}),
				},
			],
		}),
		updatedNode,
	};
};
