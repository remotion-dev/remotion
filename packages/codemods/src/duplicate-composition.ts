import type {CodemodProject, CodemodResult} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {
	type CompositionTarget,
	type CompositionMetadata,
	requireComposition,
	assertNewCompositionId,
	validateMetadata,
} from './composition-editing';
import {duplicateCompositionInSource} from './duplicate-composition-in-source';
import {parseAst} from './sequence-props/parse-ast';

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

	const output = duplicateCompositionInSource({
		input: project.files[node.filePath],
		nodePath: node.nodePath,
		newId,
		tag: newTag,
		metadata,
	});
	parseAst(output);
	return getCodemodResult({
		project,
		nextProject: {
			...project,
			files: {...project.files, [node.filePath]: output},
		},
	});
};
