import type {EffectClipboardSnapshot} from '@remotion/studio-shared';
import type {CodemodProject} from './codemod-project';
import {pasteEffects as pasteEffectsInSource} from './effect-operations';
import {getEffectSource} from './effect-references';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	getUnchangedStructureRemappings,
	getUpdatedNodeReference,
	type NodeReference,
} from './node-references';

export type PasteEffect = EffectClipboardSnapshot;
export type PasteEffectsOptions<Project extends CodemodProject> = {
	project: Project;
	node: NodeReference;
	effects: readonly PasteEffect[];
	mode?: 'append' | 'replace';
	insertAtIndices?: readonly number[] | null;
	prettierConfigOverride?: Record<string, unknown> | null;
};

export const pasteEffects = <Project extends CodemodProject>({
	project,
	node,
	effects,
	mode = 'append',
	insertAtIndices = null,
	prettierConfigOverride = null,
}: PasteEffectsOptions<Project>) => {
	const filePath = findProjectFile({project, filePath: node.filePath});
	const input = project.files[filePath];
	const {output, formatted, effectLabels, logLine} = pasteEffectsInSource({
		input,
		effects: [...effects],
		type: mode === 'replace' ? 'effects-replacing' : 'effects-additive',
		targetSequenceNodePath: node.nodePath,
		insertAtIndices: insertAtIndices === null ? null : [...insertAtIndices],
		prettierConfigOverride,
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
	const updatedNode = getUpdatedNodeReference({project, ...result, node});
	const length =
		getEffectSource({
			project: {...project, files: {...project.files, [filePath]: output}},
			node: updatedNode,
		}).length - effects.length;
	const order: (number | null)[] = Array.from({length}, () => null);
	if (insertAtIndices === null) {
		order.push(...effects.map((_, index) => index));
	} else {
		insertAtIndices
			.map((index, effect) => ({index, effect}))
			.sort((a, b) => a.index - b.index)
			.forEach(({index, effect}) =>
				order.splice(Math.min(index, order.length), 0, effect),
			);
	}

	return {
		...result,
		updatedNode,
		insertedEffects: effects.map((_, index) => ({
			...updatedNode,
			effectIndex: order.indexOf(index),
		})),
		editDetails: [{filePath, formatted, effectLabels, logLine}],
	};
};
