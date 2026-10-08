import type {CodemodProject} from './codemod-project';
import {
	type CompositionTarget,
	type CompositionMetadata,
	requireComposition,
	assertNewCompositionId,
	validateMetadata,
} from './composition-editing';
import {duplicateCompositionInSource} from './duplicate-composition-in-source';
import {getRegistrationInsertionResult} from './folder-editing';
import type {CodemodInsertionResult} from './node-references';

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
}: DuplicateCompositionOptions<Project>): CodemodInsertionResult => {
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

	const input = project.files[node.filePath];
	const output = duplicateCompositionInSource({
		input,
		nodePath: node.nodePath,
		newId,
		tag: newTag,
		metadata,
	});
	return getRegistrationInsertionResult({
		project,
		filePath: node.filePath,
		input,
		output,
		inserted: {type: 'composition', compositionId: newId},
	});
};
