import type {CodemodProject} from './codemod-project';
import {deleteEffects as deleteEffectsInSource} from './effect-operations';
import {type EffectReference, groupEffects} from './effect-references';
import {
	getNodeEditResult,
	getUnchangedStructureRemappings,
} from './node-references';

export type DeleteEffectsOptions<Project extends CodemodProject> = {
	project: Project;
	effects: EffectReference[];
};

export const deleteEffects = async <Project extends CodemodProject>({
	project,
	effects,
}: DeleteEffectsOptions<Project>) => {
	const groups = groupEffects({project, effects});
	const edits = await Promise.all(
		[...groups].map(async ([filePath, group]) => {
			const input = project.files[filePath];
			const {output} = await deleteEffectsInSource({
				input,
				effects: group.map((effect) => ({
					type: 'single-effect',
					sequenceNodePath: effect.nodePath,
					effectIndex: effect.effectIndex,
				})),
			});
			return {
				filePath,
				output,
				nodePathRemappings: getUnchangedStructureRemappings({input, output}),
			};
		}),
	);
	return getNodeEditResult({project, edits});
};
