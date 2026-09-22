import type {CodemodProject} from './codemod-project';
import {reorderEffect as reorderEffectInSource} from './effect-operations';
import {type EffectReference, getEffectSource} from './effect-references';
import {
	getNodeEditResult,
	getUnchangedStructureRemappings,
	getUpdatedNodeReference,
} from './node-references';

export type ReorderEffectOptions<Project extends CodemodProject> = {
	project: Project;
	effect: EffectReference;
	toIndex: number;
};

export const reorderEffect = async <Project extends CodemodProject>({
	project,
	effect,
	toIndex,
}: ReorderEffectOptions<Project>) => {
	const {filePath, input, length} = getEffectSource({project, node: effect});
	if (
		!Number.isInteger(toIndex) ||
		toIndex < 0 ||
		toIndex >= length ||
		!Number.isInteger(effect.effectIndex)
	) {
		throw new Error('Effect index is out of range');
	}

	const {output} = await reorderEffectInSource({
		input,
		sequenceNodePath: effect.nodePath,
		fromIndex: effect.effectIndex,
		toIndex,
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
			effectIndex: toIndex,
		},
	};
};
