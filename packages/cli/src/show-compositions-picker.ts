import {selectAsync} from './composition-prompts';

import type {getCompositions} from '@remotion/renderer';
import {chalk} from './chalk';
type Await<T> = T extends PromiseLike<infer U> ? U : T;

export const showSingleCompositionsPicker = async (
	validCompositions: Await<ReturnType<typeof getCompositions>>
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

	const selectedComposition = (await selectAsync({
		message: 'Select composition:',
		optionsPerPage: 5,
		type: 'select',
		choices: validCompositions.map((comp) => {
			return {
				value: comp.id,
				title: chalk.bold(comp.id),
			};
		}),
	})) as string;

	return {compositionId: selectedComposition, reason: 'Selected'};
};

export const showMultiCompositionsPicker = async (
	validCompositions: Await<ReturnType<typeof getCompositions>>
): Promise<string[]> => {
	if (validCompositions.length === 1) {
		const onlyComposition = validCompositions[0];
		if (onlyComposition) {
			return [onlyComposition.id];
		}
	}

	const selectedComposition = await selectAsync({
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
	});

	return selectedComposition as string[];
};
