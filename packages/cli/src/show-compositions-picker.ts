import {selectAsync} from './composition-prompts';

import type {getCompositions, LogLevel} from '@remotion/renderer';
import {chalk} from './chalk';
type Await<T> = T extends PromiseLike<infer U> ? U : T;

export const showSingleCompositionsPicker = async (
	validCompositions: Await<ReturnType<typeof getCompositions>>,
	logLevel: LogLevel,
): Promise<{compositionId: string; reason: string}> => {
	if (validCompositions.length === 1) {
		const onlyComposition = validCompositions[0];
		if (onlyComposition) {
			return {
				compositionId: onlyComposition.id,
				reason: 'Only composition',
			};
		}
	}

	const selectedComposition = (await selectAsync(
		{
			message: 'Select composition:',
			optionsPerPage: 5,
			type: 'select',
			choices: validCompositions.map((comp) => {
				return {
					value: comp.id,
					title: chalk.bold(comp.id),
				};
			}),
		},
		logLevel,
	)) as string;

	return {compositionId: selectedComposition, reason: 'Selected'};
};

export const showMultiCompositionsPicker = async (
	validCompositions: Await<ReturnType<typeof getCompositions>>,
	logLevel: LogLevel,
): Promise<string[]> => {
	if (validCompositions.length === 1) {
		const onlyComposition = validCompositions[0];
		if (onlyComposition) {
			return [onlyComposition.id];
		}
	}

	const selectedComposition = await selectAsync(
		{
			message: 'Select compositions:',
			optionsPerPage: 5,
			type: 'multiselect',
			min: 1,
			choices: validCompositions.map((comp) => {
				return {
					value: comp.id,
					title: chalk.bold(comp.id),
				};
			}),
		},
		logLevel,
	);

	return selectedComposition as string[];
};
