import {selectAsync} from './composition-prompts';

import type {getCompositions} from '@remotion/renderer';
import {chalk} from './chalk';
export type Await<T> = T extends PromiseLike<infer U> ? U : T;

export const selectComposition = async ({
	multiple,
	validCompositions,
}: {
	multiple: boolean;
	validCompositions: Await<ReturnType<typeof getCompositions>>;
}): Promise<string[] | string> => {
	if (validCompositions.length === 1) {
		const onlyComposition = validCompositions[0];
		if (onlyComposition) {
			return onlyComposition.id;
		}
	}

	const selectedComposition = await selectAsync(
		{
			message: multiple ? 'Select composition/s: ' : 'Select composition: ',
			optionsPerPage: 5,
			type: multiple ? 'multiselect' : 'select',
			choices: validCompositions.map((comp) => {
				return {
					value: comp.id,
					title: chalk.bold(comp.id),
				};
			}),
		},
		{}
	);

	return selectedComposition;
};
