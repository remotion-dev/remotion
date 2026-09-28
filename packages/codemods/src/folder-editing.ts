import type {File, JSXElement} from '@babel/types';
import * as recast from 'recast';
import type {CodemodProject} from './codemod-project';
import type {FolderReference} from './composition-editing';
import {getMoveTreeItemSourceEdits} from './folder-source-edits';
import {captureJsxNodePaths} from './get-node-path-remappings';
import {findProjectFile} from './internals';
import {getNodeEditResult} from './node-references';
import {
	getCompositionIdFromJSXElement,
	getFolderNameFromJSXElement,
} from './registration-source-edits';
import {parseAst} from './sequence-props/parse-ast';
import {applySourceEdits} from './source-edits';

export type CompositionTreeItem =
	| {type: 'composition'; compositionId: string}
	| ({type: 'folder'} & FolderReference);

export type CompositionDestination =
	| {type: 'root'}
	| {type: 'folder'; folder: FolderReference}
	| {type: 'before' | 'after'; target: CompositionTreeItem};

export type TreeEntry = {
	item: CompositionTreeItem;
	parentName: string | null;
	node: JSXElement;
	path: recast.types.NodePath;
	directJsxChild: boolean;
};

export const getTreeEntries = ({ast}: {ast: File}): TreeEntry[] => {
	const entries: TreeEntry[] = [];
	const folders: string[] = [];
	recast.visit(ast, {
		visitJSXElement(path) {
			const node = path.node as JSXElement;
			const name = getFolderNameFromJSXElement(node, ast);
			const compositionId = getCompositionIdFromJSXElement(node, ast);
			const parentName = folders.join('/') || null;
			const parent = path.parentPath?.node;
			const item: CompositionTreeItem | null =
				name !== null
					? {type: 'folder', name, parentName}
					: compositionId !== null
						? {type: 'composition', compositionId}
						: null;
			if (item) {
				entries.push({
					item,
					parentName,
					node,
					path: path as unknown as recast.types.NodePath,
					directJsxChild:
						(parent?.type === 'JSXElement' || parent?.type === 'JSXFragment') &&
						parent.children.includes(node),
				});
			}

			if (name !== null) folders.push(name);
			this.traverse(path);
			if (name !== null) folders.pop();
			return false;
		},
	});
	return entries;
};

export const requireTreeItem = (
	entries: TreeEntry[],
	item: CompositionTreeItem,
) => {
	const matches = entries.filter(({item: entry}) =>
		item.type === 'composition'
			? entry.type === 'composition' &&
				entry.compositionId === item.compositionId
			: entry.type === 'folder' &&
				entry.name === item.name &&
				entry.parentName === item.parentName,
	);
	if (matches.length !== 1) {
		throw new Error(
			`Expected one ${item.type} matching ${JSON.stringify(item)}, found ${matches.length}`,
		);
	}

	return matches[0];
};

export const moveTreeItem = <Project extends CodemodProject>({
	project,
	compositionFile,
	source,
	destination,
}: {
	project: Project;
	compositionFile: string;
	source: CompositionTreeItem;
	destination: CompositionDestination;
}) => {
	const filePath = findProjectFile({project, filePath: compositionFile});
	const input = project.files[filePath];
	const ast = parseAst(input);
	const entries = getTreeEntries({ast});
	const entry = requireTreeItem(entries, source);
	const target =
		destination.type === 'root'
			? null
			: requireTreeItem(
					entries,
					destination.type === 'folder'
						? {type: 'folder', ...destination.folder}
						: destination.target,
				);
	const destinationParentName =
		destination.type === 'folder'
			? [destination.folder.parentName, destination.folder.name]
					.filter(Boolean)
					.join('/')
			: (target?.parentName ?? null);
	if (source.type === 'folder') {
		const sourcePath = [source.parentName, source.name]
			.filter(Boolean)
			.join('/');
		if (
			destinationParentName === sourcePath ||
			destinationParentName?.startsWith(`${sourcePath}/`)
		) {
			throw new Error('A folder cannot be moved inside itself');
		}

		if (
			entries.some(
				(candidate) =>
					candidate !== entry &&
					candidate.item.type === 'folder' &&
					candidate.item.name === source.name &&
					candidate.parentName === destinationParentName,
			)
		) {
			throw new Error(
				`A folder named "${source.name}" already exists in the destination`,
			);
		}
	}

	if (
		entry === target ||
		((destination.type === 'folder' || destination.type === 'root') &&
			entry.parentName === destinationParentName)
	) {
		return {changes: [], nodePathRemappings: []};
	}

	if (!entry.directJsxChild)
		throw new Error(
			'Could not locate the JSX element to move as a direct JSX child',
		);
	if (target && !target.directJsxChild)
		throw new Error(
			'Could not locate the JSX destination as a direct JSX child',
		);
	const nextContents = applySourceEdits({
		input,
		edits: getMoveTreeItemSourceEdits({
			input,
			source: entry,
			target,
			position: destination.type,
		}),
	});
	const nextAst = parseAst(nextContents);
	const nextEntries = getTreeEntries({ast: nextAst});
	const movedEntry = requireTreeItem(
		nextEntries,
		source.type === 'composition'
			? source
			: {
					type: 'folder',
					name: source.name,
					parentName: destinationParentName,
				},
	);
	const before = captureJsxNodePaths(ast);
	const after = captureJsxNodePaths(nextAst);
	const beforeMovedNodes = new Set<object>([entry.node.openingElement]);
	const afterMovedNodes = new Set<object>([movedEntry.node.openingElement]);
	for (const captured of before) {
		if (
			captured.parentNode !== null &&
			beforeMovedNodes.has(captured.parentNode)
		) {
			beforeMovedNodes.add(captured.node);
		}
	}

	for (const captured of after) {
		if (
			captured.parentNode !== null &&
			afterMovedNodes.has(captured.parentNode)
		) {
			afterMovedNodes.add(captured.node);
		}
	}

	const beforeMoved = before.filter(({node}) => beforeMovedNodes.has(node));
	const afterMoved = after.filter(({node}) => afterMovedNodes.has(node));
	const beforeUnmoved = before.filter(({node}) => !beforeMovedNodes.has(node));
	const afterUnmoved = after.filter(({node}) => !afterMovedNodes.has(node));
	if (
		beforeMoved.length !== afterMoved.length ||
		beforeUnmoved.length !== afterUnmoved.length
	) {
		throw new Error('Could not remap JSX nodes after moving a tree item');
	}

	const nodePathRemappings = [
		...beforeMoved.map((node, index) => ({node, next: afterMoved[index]})),
		...beforeUnmoved.map((node, index) => ({node, next: afterUnmoved[index]})),
	].flatMap(({node, next}) =>
		JSON.stringify(node.nodePath) === JSON.stringify(next.nodePath) &&
		node.signature === next.signature
			? []
			: [{oldNodePath: node.nodePath, newNodePath: next.nodePath}],
	);

	return getNodeEditResult({
		project,
		edits: [{filePath, output: nextContents, nodePathRemappings}],
	});
};
