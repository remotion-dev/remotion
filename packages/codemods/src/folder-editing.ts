import type {File, JSXElement} from '@babel/types';
import * as recast from 'recast';
import type {CodemodProject} from './codemod-project';
import type {FolderReference} from './composition-editing';
import {getMoveTreeItemSourceEdits} from './folder-source-edits';
import {
	captureJsxNodePaths,
	collectJsxSubtree,
	requireCapturedNodePath,
} from './get-node-path-remappings';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	getSubtreeEditRemappings,
	type CodemodInsertionResult,
	type CodemodNodeResult,
	type NodeReference,
} from './node-references';
import {
	findRegistrationRoot,
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

// The result of inserting one registration element. The element is located in
// the output by its ID or folder reference, or as the last element appended to
// the folder or the registration root.
export const getRegistrationInsertionResult = ({
	project,
	filePath,
	input,
	output,
	inserted,
}: {
	project: CodemodProject;
	filePath: string;
	input: string;
	output: string;
	inserted:
		| CompositionTreeItem
		| {type: 'last-child'; folder: FolderReference | null};
}): CodemodInsertionResult => {
	const before = captureJsxNodePaths(parseAst(input));
	const nextAst = parseAst(output);
	const after = captureJsxNodePaths(nextAst);
	let element: JSXElement;
	if (inserted.type === 'last-child') {
		const root = findRegistrationRoot({ast: nextAst, folder: inserted.folder});
		const last = root.children.findLast(
			(child): child is JSXElement => child.type === 'JSXElement',
		);
		if (!last) {
			throw new Error('Could not locate the inserted registration');
		}

		element = last;
	} else {
		element = requireTreeItem(getTreeEntries({ast: nextAst}), inserted).node;
	}

	const nodePathRemappings = getSubtreeEditRemappings({
		before,
		after,
		subtrees: [
			{
				before: new Set(),
				after: collectJsxSubtree(after, element.openingElement),
			},
		],
	});
	return {
		...getNodeEditResult({
			project,
			edits: [{filePath, output, nodePathRemappings}],
		}),
		insertedNode: {
			filePath,
			nodePath: requireCapturedNodePath(after, element.openingElement),
		},
	};
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
}): CodemodNodeResult & {updatedNode: NodeReference} => {
	const filePath = findProjectFile({project, filePath: compositionFile});
	const input = project.files[filePath];
	const ast = parseAst(input);
	const entries = getTreeEntries({ast});
	const entry = requireTreeItem(entries, source);
	const before = captureJsxNodePaths(ast);
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
		return {
			changes: [],
			nodePathRemappings: [],
			updatedNode: {
				filePath,
				nodePath: requireCapturedNodePath(before, entry.node.openingElement),
			},
		};
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
	const after = captureJsxNodePaths(nextAst);
	const nodePathRemappings = getSubtreeEditRemappings({
		before,
		after,
		subtrees: [
			{
				before: collectJsxSubtree(before, entry.node.openingElement),
				after: collectJsxSubtree(after, movedEntry.node.openingElement),
			},
		],
	});

	return {
		...getNodeEditResult({
			project,
			edits: [{filePath, output: nextContents, nodePathRemappings}],
		}),
		updatedNode: {
			filePath,
			nodePath: requireCapturedNodePath(after, movedEntry.node.openingElement),
		},
	};
};
