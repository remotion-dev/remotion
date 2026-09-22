import type {CodemodProject, CodemodResult} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {
	type CompositionTarget,
	requireComposition,
	assertNewCompositionId,
	editCompositionProject,
} from './composition-editing';

export type RenameCompositionOptions<Project extends CodemodProject> =
	CompositionTarget & {project: Project; newId: string};

export const renameComposition = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	newId,
}: RenameCompositionOptions<Project>): CodemodResult<Project> => {
	requireComposition({project, compositionFile, compositionId});
	if (newId === compositionId) {
		return getCodemodResult({project, nextProject: project});
	}

	assertNewCompositionId({project, compositionFile, compositionId: newId});
	return editCompositionProject({
		project,
		compositionFile,
		codemod: {type: 'rename-composition', idToRename: compositionId, newId},
	});
};
