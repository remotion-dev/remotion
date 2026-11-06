import type {CodemodProject} from './codemod-project';
import type {CompositionTarget} from './composition-editing';
import {type CompositionDestination, moveTreeItem} from './folder-editing';

export type MoveCompositionOptions<Project extends CodemodProject> =
	CompositionTarget & {
		project: Project;
		destination: CompositionDestination;
		destinationFile?: string;
	};

export const moveComposition = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	destination,
	destinationFile,
}: MoveCompositionOptions<Project>) =>
	moveTreeItem({
		project,
		compositionFile,
		source: {type: 'composition', compositionId},
		destination,
		destinationFile: destinationFile ?? null,
	});
