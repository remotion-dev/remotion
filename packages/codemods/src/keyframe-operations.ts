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
	getEffectSource,
	type EffectReference,
} from './public-effect-operations';
import {
	updateEffectKeyframes as updateEffectKeyframesInSource,
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

export type UpdateEffectKeyframesOptions<Project extends CodemodProject> = Omit<
	UpdateJsxNodeKeyframesOptions<Project>,
	'node'
> & {effect: EffectReference};

export const updateEffectKeyframes = async <Project extends CodemodProject>({
	project,
	effect,
	updates,
	schema,
	videoConfig,
}: UpdateEffectKeyframesOptions<Project>) => {
	if (updates.length === 0) {
		throw new Error('Expected at least one keyframe update');
	}

	if (!Number.isInteger(effect.effectIndex) || effect.effectIndex < 0) {
		throw new Error('Effect index must be a non-negative integer');
	}

	const {filePath, input} = getEffectSource({project, node: effect});
	const {output} = await updateEffectKeyframesInSource({
		input,
		sequenceNodePath: effect.nodePath,
		effectIndex: effect.effectIndex,
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
	return {
		...result,
		updatedEffect: {
			...getUpdatedNodeReference({...result, node: effect}),
			effectIndex: effect.effectIndex,
		},
	};
};
