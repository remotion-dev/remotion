import {selectAsync} from './composition-prompts';

import type {getCompositions} from '@remotion/renderer';
import {chalk} from './chalk';
export type Await<T> = T extends PromiseLike<infer U> ? U : T;

export const selectComposition = async (
	validCompositions: Await<ReturnType<typeof getCompositions>>
): Promise<string[] | string> => {
	if (validCompositions.length === 1) {
		const onlyComposition = validCompositions[0];
		if (onlyComposition) {
			return onlyComposition.id;
		}
	}

	const selectedComposition = await selectAsync({
		message: 'Select composition:',
		optionsPerPage: 5,
		type: 'select',
		choices: validCompositions.map((comp) => {
			return {
				value: comp.id,
				title: chalk.bold(comp.id),
			};
		}),
	});

	return selectedComposition;
};

export const selectCompositions = async (
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
