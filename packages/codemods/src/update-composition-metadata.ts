import type {CodemodProject, CodemodResult} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {
	type CompositionTarget,
	type CompositionMetadata,
	requireComposition,
	validateMetadata,
	editCompositionProject,
} from './composition-editing';

export type UpdateCompositionMetadataOptions<Project extends CodemodProject> =
	CompositionTarget & {
		project: Project;
		metadata: Partial<CompositionMetadata>;
	};

export const updateCompositionMetadata = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	metadata,
}: UpdateCompositionMetadataOptions<Project>): CodemodResult<Project> => {
	const node = requireComposition({project, compositionFile, compositionId});
	validateMetadata(metadata);
	if (
		node.tagName === 'Still' &&
		(metadata.fps !== undefined || metadata.durationInFrames !== undefined)
	) {
		throw new Error('Still registrations do not have fps or durationInFrames');
	}

	if (Object.values(metadata).every((value) => value === undefined)) {
		return getCodemodResult({project, nextProject: project});
	}

	return editCompositionProject({
		project,
		compositionFile,
		codemod: {
			type: 'update-composition-metadata',
			idToUpdate: compositionId,
			newWidth: metadata.width ?? null,
			newHeight: metadata.height ?? null,
			newFps: metadata.fps ?? null,
			newDurationInFrames: metadata.durationInFrames ?? null,
		},
	});
};
