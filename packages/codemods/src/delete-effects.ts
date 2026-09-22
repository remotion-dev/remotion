import type {CodemodProject} from './codemod-project';
import {deleteEffects as deleteEffectsInSource} from './effect-operations';
import {type EffectReference, groupEffects} from './effect-references';
import {
	getNodeEditResult,
	getUnchangedStructureRemappings,
} from './node-references';

export type DeleteEffectsOptions<Project extends CodemodProject> = {
	project: Project;
	effects: (
		| EffectReference
		| (Omit<EffectReference, 'effectIndex'> & {effectIndex: null})
	)[];
};

export const deleteEffects = async <Project extends CodemodProject>({
	project,
	effects,
}: DeleteEffectsOptions<Project>) => {
	const groups = groupEffects({project, effects});
	const edits = await Promise.all(
		[...groups].map(async ([filePath, group]) => {
			const input = project.files[filePath];
			const {output, formatted, effectLabels, logLines} =
				await deleteEffectsInSource({
					input,
					effects: group.map((effect) =>
						effect.effectIndex === null
							? {
									type: 'all-effects',
									sequenceNodePath: effect.nodePath,
								}
							: {
									type: 'single-effect',
									sequenceNodePath: effect.nodePath,
									effectIndex: effect.effectIndex,
								},
					),
				});
			return {
				filePath,
				output,
				formatted,
				effectLabels,
				logLines,
				nodePathRemappings: getUnchangedStructureRemappings({input, output}),
			};
		}),
	);
	return {
		...getNodeEditResult({project, edits}),
		editDetails: edits.map(({filePath, formatted, effectLabels, logLines}) => ({
			filePath,
			formatted,
			effectLabels,
			logLines,
		})),
	};
};
