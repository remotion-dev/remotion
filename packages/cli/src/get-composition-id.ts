import {Log} from './log';
import {parsedCli} from './parse-command-line';
import {selectComposition} from './select-composition';

export const getCompositionId = async () => {
	if (!parsedCli._[2]) {
		Log.error('Composition ID not passed.');

		const selectedComposition = await selectComposition();
		return selectedComposition;
	}

	return parsedCli._[2];
};
