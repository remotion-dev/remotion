import type {AddFolderOptions} from './add-folder';
import type {CodemodProject} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {editCompositionProject} from './composition-editing';
import {getTreeEntries, requireTreeItem} from './folder-editing';

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
