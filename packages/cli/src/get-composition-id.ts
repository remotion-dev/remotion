// eslint-disable-next-line no-restricted-imports
import type {TCompMetadata} from 'remotion';
import {Log} from './log';
import {parsedCli} from './parse-command-line';
import {selectComposition} from './select-composition';

export const getCompositionId = async (
	validCompositions: TCompMetadata[]
): Promise<{
	compositionId: string;
	reason: string;
	config: TCompMetadata;
}> => {
	if (parsedCli._[2]) {
		const config = validCompositions.find((c) => c.id === parsedCli._[2]);

		if (!config) {
			throw new Error(
				`Cannot find composition with ID "${
					parsedCli._[2]
				}". Available composition: ${validCompositions
					.map((c) => c.id)
					.join(', ')}`
			);
		}

		return {
			compositionId: parsedCli._[2],
			reason: 'Passed as argument',
			config,
		};
	}

	if (!process.env.CI) {
		const {compositionId, reason} = await selectComposition(validCompositions);
		if (compositionId && typeof compositionId === 'string') {
			return {
				compositionId,
				reason,
				config: validCompositions.find(
					(c) => c.id === compositionId
				) as TCompMetadata,
			};
		}
	}

	Log.error('Composition ID not passed.');
	Log.error('Pass an extra argument <composition-id>.');
	process.exit(1);
};
