import type {AnyCompMetadata} from 'remotion';
import {Log} from './log';
import {selectComposition} from './select-composition';

const getCompName = ({
	cliArgs,
	compositionIdFromUi,
}: {
	cliArgs: string[];
	compositionIdFromUi: string | null;
}): {
	compName: string;
	remainingArgs: string[];
	reason: string;
} => {
	if (compositionIdFromUi) {
		return {
			compName: compositionIdFromUi,
			remainingArgs: [],
			reason: 'via UI',
		};
	}

	const [compName, ...remainingArgs] = cliArgs;

	return {compName, remainingArgs, reason: 'Passed as argument'};
};

export const getCompositionId = async ({
	validCompositions,
	args,
	compositionIdFromUi,
}: {
	validCompositions: AnyCompMetadata[];
	args: string[];
	compositionIdFromUi: string | null;
}): Promise<{
	compositionId: string;
	reason: string;
	config: AnyCompMetadata;
	argsAfterComposition: string[];
}> => {
	const {
		compName,
		remainingArgs,
		reason: compReason,
	} = getCompName({
		cliArgs: args,
		compositionIdFromUi,
	});
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
			reason: compReason,
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
				) as AnyCompMetadata,
				argsAfterComposition: args,
			};
		}
	}

	Log.error('Composition ID not passed.');
	Log.error('Pass an extra argument <composition-id>.');
	process.exit(1);
};
