import {Log} from './log';
import {parsedCli} from './parse-command-line';
import {selectComposition} from './select-composition';

export const getCompositionId = async () => {
	if (parsedCli._[2]) {
		return parsedCli._[2];
	}

	if (!process.env.CI) {
		const selectedComposition = await selectComposition();
		if (selectedComposition && typeof selectedComposition === 'string') {
			return selectedComposition;
		}
	}

	Log.error('Composition ID not passed.');
};
