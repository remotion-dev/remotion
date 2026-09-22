import type {File, JSXElement} from '@babel/types';
import * as recast from 'recast';
import type {CodemodProject} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import type {FolderReference} from './composition-editing';
import {getMoveTreeItemSourceEdits} from './folder-source-edits';
import {findProjectFile} from './internals';
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
	const entries = getTreeEntries({ast: parseAst(input)});
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
		return getCodemodResult({project, nextProject: project});
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
	parseAst(nextContents);
	return getCodemodResult({
		project,
		nextProject: {
			...project,
			files: {...project.files, [filePath]: nextContents},
		},
	});
};
