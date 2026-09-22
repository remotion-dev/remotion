import type {JSXElement} from '@babel/types';
import type {CompositionOrFolder, RecastCodemod} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {CodemodProject} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {
	type FolderReference,
	editCompositionProject,
} from './composition-editing';
import {findProjectFile} from './internals';
import {
	getCompositionIdFromJSXElement,
	getFolderNameFromJSXElement,
} from './recast-mods';
import {parseAst} from './sequence-props/parse-ast';

export type CompositionTreeItem =
	| {type: 'composition'; compositionId: string}
	| ({type: 'folder'} & FolderReference);

export type CompositionDestination =
	| {type: 'root'}
	| {type: 'folder'; folder: FolderReference}
	| {type: 'before' | 'after'; target: CompositionTreeItem};

type TreeEntry = {item: CompositionTreeItem; parentName: string | null};

export const getTreeEntries = ({
	project,
	compositionFile,
}: {
	project: CodemodProject;
	compositionFile: string;
}): TreeEntry[] => {
	const filePath = findProjectFile({project, filePath: compositionFile});
	const ast = parseAst(project.files[filePath]);
	const entries: TreeEntry[] = [];
	const folders: string[] = [];
	recast.visit(ast, {
		visitJSXElement(path) {
			const element = path.node as JSXElement;
			const name = getFolderNameFromJSXElement(element);
			const compositionId = getCompositionIdFromJSXElement(element);
			const parentName = folders.join('/') || null;
			if (name !== null) {
				entries.push({item: {type: 'folder', name, parentName}, parentName});
				folders.push(name);
			} else if (compositionId) {
				entries.push({item: {type: 'composition', compositionId}, parentName});
			}

			this.traverse(path);
			if (name !== null) {
				folders.pop();
			}

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

const toSourceItem = (item: CompositionTreeItem): CompositionOrFolder =>
	item.type === 'composition'
		? item
		: {type: 'folder', folderName: item.name, parentName: item.parentName};

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
	const entries = getTreeEntries({project, compositionFile});
	const entry = requireTreeItem(entries, source);
	let target: Extract<
		RecastCodemod,
		{type: 'move-composition-or-folder'}
	>['destination'];
	if (destination.type === 'folder') {
		requireTreeItem(entries, {type: 'folder', ...destination.folder});
		const parentPath = [destination.folder.parentName, destination.folder.name]
			.filter(Boolean)
			.join('/');
		if (entry.parentName === parentPath) {
			return getCodemodResult({project, nextProject: project});
		}

		target = {
			type: 'folder',
			folderName: destination.folder.name,
			parentName: destination.folder.parentName,
		};
	} else if (destination.type === 'root') {
		if (entry.parentName === null) {
			return getCodemodResult({project, nextProject: project});
		}

		target = destination;
	} else {
		const targetEntry = requireTreeItem(entries, destination.target);
		if (entry === targetEntry) {
			return getCodemodResult({project, nextProject: project});
		}

		target = {type: destination.type, target: toSourceItem(destination.target)};
	}

	return editCompositionProject({
		project,
		compositionFile,
		codemod: {
			type: 'move-composition-or-folder',
			source: toSourceItem(source),
			destination: target,
		},
	});
};
