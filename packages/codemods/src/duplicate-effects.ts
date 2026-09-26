import type {CodemodProject} from './codemod-project';
import {duplicateEffects as duplicateEffectsInSource} from './effect-operations';
import type {EffectReference} from './effect-references';
import {groupEffects} from './effect-references';
import {
	getNodeEditResult,
	getUnchangedStructureRemappings,
	getUpdatedNodeReference,
} from './node-references';

export type DuplicateEffectsOptions<Project extends CodemodProject> = {
	project: Project;
	effects: EffectReference[];
};

export const duplicateEffects = async <Project extends CodemodProject>({
	project,
	effects,
}: DuplicateEffectsOptions<Project>) => {
	const groups = groupEffects({project, effects});
	const edits = await Promise.all(
		[...groups].map(async ([filePath, group]) => {
			const input = project.files[filePath];
			const {output, formatted, effectLabels, logLines} =
				await duplicateEffectsInSource({
					input,
					effects: group.map((effect) => ({
						sequenceNodePath: effect.nodePath,
						effectIndex: effect.effectIndex,
					})),
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
	const result = getNodeEditResult({project, edits});
	return {
		...result,
		editDetails: edits.map(({filePath, formatted, effectLabels, logLines}) => ({
			filePath,
			formatted,
			effectLabels,
			logLines,
		})),
		insertedEffects: [...groups.values()].flatMap((group) =>
			group.map((effect) => ({
				...getUpdatedNodeReference({project, ...result, node: effect}),
				effectIndex:
					effect.effectIndex +
					1 +
					group.filter(
						(other) =>
							JSON.stringify(other.nodePath) ===
								JSON.stringify(effect.nodePath) &&
							other.effectIndex < effect.effectIndex,
					).length,
			})),
		),
	};
};
