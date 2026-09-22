import type {CodemodProject, CodemodResult} from './codemod-project';
import {
	type CompositionTarget,
	type CompositionMetadata,
	requireComposition,
	assertNewCompositionId,
	validateMetadata,
	editCompositionProject,
} from './composition-editing';

export type DuplicateCompositionOptions<Project extends CodemodProject> =
	CompositionTarget & {
		project: Project;
		newId: string;
		tag?: 'Composition' | 'Still';
		metadata?: Partial<CompositionMetadata>;
	};

export const duplicateComposition = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	newId,
	tag,
	metadata = {},
}: DuplicateCompositionOptions<Project>): CodemodResult<Project> => {
	const node = requireComposition({project, compositionFile, compositionId});
	assertNewCompositionId({project, compositionFile, compositionId: newId});
	validateMetadata(metadata);
	const newTag = tag ?? (node.tagName === 'Still' ? 'Still' : 'Composition');
	if (
		newTag === 'Still' &&
		(metadata.fps !== undefined || metadata.durationInFrames !== undefined)
	) {
		throw new Error('Still registrations do not have fps or durationInFrames');
	}

	return editCompositionProject({
		project,
		compositionFile,
		codemod: {
			type: 'duplicate-composition',
			idToDuplicate: compositionId,
			newId,
			tag: newTag,
			newWidth: metadata.width ?? null,
			newHeight: metadata.height ?? null,
			newFps: metadata.fps ?? null,
			newDurationInFrames: metadata.durationInFrames ?? null,
		},
	});
};
