import type {JSXElement} from '@babel/types';
import type {CompositionOrFolder, RecastCodemod} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {CodemodProject} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {
	editCompositionProject,
	type CompositionTarget,
	type FolderReference,
} from './composition-operations';
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

const getTreeEntries = ({
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

const requireTreeItem = (entries: TreeEntry[], item: CompositionTreeItem) => {
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

const moveTreeItem = <Project extends CodemodProject>({
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

export type AddFolderOptions<Project extends CodemodProject> = {
	project: Project;
	compositionFile: string;
	folder: FolderReference;
};

export const addFolder = <Project extends CodemodProject>({
	project,
	compositionFile,
	folder,
}: AddFolderOptions<Project>) => {
	if (!folder.name || folder.name.includes('/')) {
		throw new Error('Folder names must be non-empty and cannot contain /');
	}

	const entries = getTreeEntries({project, compositionFile});
	if (
		entries.some(
			({item}) =>
				item.type === 'folder' &&
				item.name === folder.name &&
				item.parentName === folder.parentName,
		)
	) {
		throw new Error('A folder with this name already exists in the parent');
	}

	if (folder.parentName !== null) {
		const parts = folder.parentName.split('/');
		const name = parts.pop()!;
		requireTreeItem(entries, {
			type: 'folder',
			name,
			parentName: parts.join('/') || null,
		});
	}

	return editCompositionProject({
		project,
		compositionFile,
		codemod: {
			type: 'new-folder',
			folderName: folder.name,
			parentName: folder.parentName,
		},
	});
};

export type RenameFolderOptions<Project extends CodemodProject> =
	AddFolderOptions<Project> & {newName: string};

export const renameFolder = <Project extends CodemodProject>({
	project,
	compositionFile,
	folder,
	newName,
}: RenameFolderOptions<Project>) => {
	const entries = getTreeEntries({project, compositionFile});
	requireTreeItem(entries, {type: 'folder', ...folder});
	if (newName === folder.name) {
		return getCodemodResult({project, nextProject: project});
	}

	if (!newName || newName.includes('/')) {
		throw new Error('Folder names must be non-empty and cannot contain /');
	}

	if (
		entries.some(
			({item}) =>
				item.type === 'folder' &&
				item.name === newName &&
				item.parentName === folder.parentName,
		)
	) {
		throw new Error('A folder with this name already exists in the parent');
	}

	return editCompositionProject({
		project,
		compositionFile,
		codemod: {
			type: 'rename-folder',
			folderName: folder.name,
			parentName: folder.parentName,
			newName,
		},
	});
};

export type UnwrapFolderOptions<Project extends CodemodProject> =
	AddFolderOptions<Project>;

export const unwrapFolder = <Project extends CodemodProject>({
	project,
	compositionFile,
	folder,
}: UnwrapFolderOptions<Project>) => {
	requireTreeItem(getTreeEntries({project, compositionFile}), {
		type: 'folder',
		...folder,
	});
	return editCompositionProject({
		project,
		compositionFile,
		codemod: {
			type: 'delete-folder',
			folderName: folder.name,
			parentName: folder.parentName,
		},
	});
};

export type MoveCompositionOptions<Project extends CodemodProject> =
	CompositionTarget & {project: Project; destination: CompositionDestination};
export const moveComposition = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	destination,
}: MoveCompositionOptions<Project>) =>
	moveTreeItem({
		project,
		compositionFile,
		source: {type: 'composition', compositionId},
		destination,
	});

export type MoveFolderOptions<Project extends CodemodProject> =
	AddFolderOptions<Project> & {destination: CompositionDestination};
export const moveFolder = <Project extends CodemodProject>({
	project,
	compositionFile,
	folder,
	destination,
}: MoveFolderOptions<Project>) =>
	moveTreeItem({
		project,
		compositionFile,
		source: {type: 'folder', ...folder},
		destination,
	});
