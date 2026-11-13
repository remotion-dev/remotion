import type {CodemodProject} from './codemod-project';
import {reorderEffects as reorderEffectsInSource} from './effect-operations';
import {type EffectReference, getEffectSource} from './effect-references';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	getUnchangedStructureRemappings,
	getUpdatedNodeReference,
} from './node-references';

export type ReorderEffectsOptions<Project extends CodemodProject> = {
	project: Project;
	effects: readonly EffectReference[];
	toIndex: number;
};

export const reorderEffects = async <Project extends CodemodProject>({
	project,
	effects,
	toIndex,
}: ReorderEffectsOptions<Project>) => {
	if (effects.length === 0) {
		throw new Error('Expected at least one effect to reorder');
	}

	const node = effects[0];
	const {filePath, input} = getEffectSource({project, node});
	if (
		effects.some(
			(effect) =>
				findProjectFile({project, filePath: effect.filePath}) !== filePath ||
				JSON.stringify(effect.nodePath) !== JSON.stringify(node.nodePath),
		)
	) {
		throw new Error('Effects must belong to the same JSX node to reorder them');
	}

	const fromIndices = effects.map((effect) => effect.effectIndex);
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
		updatedEffects: effects.map((effect) => ({
			...getUpdatedNodeReference({project, ...result, node: effect}),
			effectIndex:
				toIndex +
				fromIndices.filter((index) => index < effect.effectIndex).length,
		})),
	};
};
