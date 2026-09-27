import type {CodemodProject} from './codemod-project';
import {type EffectReference, getEffectSource} from './effect-references';
import {
	getNodeEditResult,
	getUnchangedStructureRemappings,
	getUpdatedNodeReference,
} from './node-references';
import {updateEffectKeyframes as updateEffectKeyframesInSource} from './update-keyframes';
import type {UpdateNodeKeyframesOptions} from './update-node-keyframes';

export type UpdateEffectKeyframesOptions<Project extends CodemodProject> = Omit<
	UpdateNodeKeyframesOptions<Project>,
	'node'
> & {effect: EffectReference};

export const updateEffectKeyframes = async <Project extends CodemodProject>({
	project,
	effect,
	updates,
	schema,
	videoConfig,
	prettierConfigOverride,
}: UpdateEffectKeyframesOptions<Project>) => {
	if (updates.length === 0) {
		throw new Error('Expected at least one keyframe update');
	}

	if (!Number.isInteger(effect.effectIndex) || effect.effectIndex < 0) {
		throw new Error('Effect index must be a non-negative integer');
	}

	const {filePath, input} = getEffectSource({project, node: effect});
	const {output, ...details} = await updateEffectKeyframesInSource({
		input,
		sequenceNodePath: effect.nodePath,
		effectIndex: effect.effectIndex,
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
		updatedEffect: {
			...getUpdatedNodeReference({project, ...result, node: effect}),
			effectIndex: effect.effectIndex,
		},
	};
};
