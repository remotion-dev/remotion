import type {CodemodProject} from './codemod-project';
import type {CompositionTarget} from './composition-editing';
import {type CompositionDestination, moveTreeItem} from './folder-editing';

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
