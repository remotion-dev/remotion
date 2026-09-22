import type {CodemodProject} from './codemod-project';
import {
	type FolderReference,
	editCompositionProject,
} from './composition-editing';
import {getTreeEntries, requireTreeItem} from './folder-editing';

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
