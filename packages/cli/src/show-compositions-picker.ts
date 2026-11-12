import type {getCompositions, LogLevel} from '@remotion/renderer';
import {chalk} from './chalk';
import {cleanupBeforeQuit} from './cleanup-before-quit';
import {selectAsync} from './composition-prompts';
import {Log} from './log';
type Await<T> = T extends PromiseLike<infer U> ? U : T;

export const showSingleCompositionsPicker = async (
	validCompositions: Await<ReturnType<typeof getCompositions>>,
	logLevel: LogLevel,
): Promise<{compositionId: string; reason: string}> => {
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

	if (!process.stdin.isTTY || !process.stdout.isTTY || process.env.CI) {
		Log.error(
			{indent: false, logLevel},
			'Composition IDs not passed. Pass a comma-separated list of composition IDs.',
		);
		Log.error(
			{indent: false, logLevel},
			`Available compositions: ${validCompositions.map((c) => c.id).join(', ')}`,
		);
		cleanupBeforeQuit({indent: false, logLevel});
		process.exit(1);
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
