import type {AddFolderOptions} from './add-folder';
import type {CodemodProject} from './codemod-project';
import {type CompositionDestination, moveTreeItem} from './folder-editing';

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
