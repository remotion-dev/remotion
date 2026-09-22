import type {AddFolderOptions} from './add-folder';
import type {CodemodProject} from './codemod-project';
import {editCompositionProject} from './composition-editing';
import {requireTreeItem, getTreeEntries} from './folder-editing';

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
