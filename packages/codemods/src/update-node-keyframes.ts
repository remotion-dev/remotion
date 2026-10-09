import type {InteractivitySchema, VideoConfigValues} from 'remotion';
import type {CodemodProject} from './codemod-project';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	getUnchangedStructureRemappings,
	getUpdatedNodeReference,
	type NodeReference,
} from './node-references';
import {
	updateSequenceKeyframes,
	type SequenceKeyframeUpdate,
} from './update-keyframes';

export type NodeKeyframeUpdate = SequenceKeyframeUpdate;

export type UpdateNodeKeyframesOptions<Project extends CodemodProject> = {
	project: Project;
	node: NodeReference;
	updates: NodeKeyframeUpdate[];
	schema?: InteractivitySchema;
	videoConfig?: VideoConfigValues;
	prettierConfigOverride?: Record<string, unknown> | null;
};

export const updateNodeKeyframes = async <Project extends CodemodProject>({
	project,
	node,
	updates,
	schema,
	videoConfig,
	prettierConfigOverride,
}: UpdateNodeKeyframesOptions<Project>) => {
	if (updates.length === 0) {
		throw new Error('Expected at least one keyframe update');
	}

	const filePath = findProjectFile({project, filePath: node.filePath});
	const input = project.files[filePath];
	const {output, ...details} = await updateSequenceKeyframes({
		input,
		nodePath: node.nodePath,
		updates,
		schema,
		videoConfigValues: videoConfig ?? null,
		prettierConfigOverride,
	});
	const result = getNodeEditResult({
		project,
		edits: [
			{
				filePath,
				output,
				nodePathRemappings: getUnchangedStructureRemappings({input, output}),
			},
		],
	});
	return {
		...result,
		...details,
		updatedNode: getUpdatedNodeReference({project, ...result, node}),
	};
};
