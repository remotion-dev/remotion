import type {CodemodProject} from './codemod-project';
import {reorderEffects as reorderEffectsInSource} from './effect-operations';
import {type EffectReference, getEffectSource} from './effect-references';
import {
	getNodeEditResult,
	getUnchangedStructureRemappings,
	getUpdatedNodeReference,
	type NodeReference,
} from './node-references';

export type ReorderEffectOptions<Project extends CodemodProject> = {
	project: Project;
	effect: EffectReference;
	toIndex: number;
};

export const reorderEffects = async ({
	project,
	node,
	fromIndices,
	toIndex,
}: {
	project: CodemodProject;
	node: NodeReference;
	fromIndices: readonly number[];
	toIndex: number;
}) => {
	const {filePath, input} = getEffectSource({project, node});
	const {output, formatted, effectLabel, logLine} =
		await reorderEffectsInSource({
			input,
			sequenceNodePath: node.nodePath,
			fromIndices,
			toIndex,
		});
	const result = getNodeEditResult({
		project,
		edits: [
			{
				filePath,
				output,
				nodePathRemappings: getUnchangedStructureRemappings({
					input,
					output,
				}).map((remapping) => ({...remapping, effectsOnly: true as const})),
			},
		],
	});
	return {
		...result,
		editDetails: [{filePath, formatted, effectLabel, logLine}],
	};
};

export const reorderEffect = async <Project extends CodemodProject>({
	project,
	effect,
	toIndex,
}: ReorderEffectOptions<Project>) => {
	const result = await reorderEffects({
		project,
		node: effect,
		fromIndices: [effect.effectIndex],
		toIndex,
	});
	return {
		...result,
		updatedEffect: {
			...getUpdatedNodeReference({project, ...result, node: effect}),
			effectIndex: toIndex,
		},
	};
};
