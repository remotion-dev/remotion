import type {InteractivitySchema, VideoConfigValues} from 'remotion';
import type {CodemodProject} from './codemod-project';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	getUnchangedStructureRemappings,
	getUpdatedNodeReference,
	type JsxNodeReference,
} from './node-references';
import {
	updateSequenceKeyframes,
	type SequenceKeyframeUpdate,
} from './update-keyframes';

export type JsxNodeKeyframeUpdate = SequenceKeyframeUpdate;

export type UpdateJsxNodeKeyframesOptions<Project extends CodemodProject> = {
	project: Project;
	node: JsxNodeReference;
	updates: JsxNodeKeyframeUpdate[];
	schema?: InteractivitySchema;
	videoConfig?: VideoConfigValues;
};

export const updateJsxNodeKeyframes = async <Project extends CodemodProject>({
	project,
	node,
	updates,
	schema,
	videoConfig,
}: UpdateJsxNodeKeyframesOptions<Project>) => {
	if (updates.length === 0) {
		throw new Error('Expected at least one keyframe update');
	}

	const filePath = findProjectFile({project, filePath: node.filePath});
	const input = project.files[filePath];
	const {output} = await updateSequenceKeyframes({
		input,
		nodePath: node.nodePath,
		updates,
		schema,
		videoConfigValues: videoConfig ?? null,
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
	return {...result, updatedNode: getUpdatedNodeReference({...result, node})};
};
