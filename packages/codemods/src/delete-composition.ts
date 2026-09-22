import type {CodemodProject, CodemodResult} from './codemod-project';
import {
	type CompositionTarget,
	requireComposition,
	editCompositionProject,
} from './composition-editing';

export type DeleteCompositionOptions<Project extends CodemodProject> =
	CompositionTarget & {project: Project};

export const deleteComposition = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
}: DeleteCompositionOptions<Project>): CodemodResult<Project> => {
	requireComposition({project, compositionFile, compositionId});
	return editCompositionProject({
		project,
		compositionFile,
		codemod: {type: 'delete-composition', idToDelete: compositionId},
	});
};
