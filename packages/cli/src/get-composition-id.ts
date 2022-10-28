// eslint-disable-next-line no-restricted-imports
import type {TCompMetadata} from 'remotion';
import {Log} from './log';
import {selectComposition} from './select-composition';

export const getCompositionId = async (
	validCompositions: TCompMetadata[],
	args: string[]
): Promise<{
	compositionId: string;
	reason: string;
	config: TCompMetadata;
	argsAfterComposition: string[];
}> => {
	const [compName, ...remainingArgs] = args;
	if (compName) {
		const config = validCompositions.find((c) => c.id === compName);

		if (!config) {
			throw new Error(
				`Cannot find composition with ID "${compName}". Available composition: ${validCompositions
					.map((c) => c.id)
					.join(', ')}`
			);
		}

		return {
			compositionId: compName,
			reason: 'Passed as argument',
			config,
			argsAfterComposition: remainingArgs,
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
				argsAfterComposition: args,
			};
		}
	}

	Log.error('Composition ID not passed.');
	Log.error('Pass an extra argument <composition-id>.');
	process.exit(1);
};
