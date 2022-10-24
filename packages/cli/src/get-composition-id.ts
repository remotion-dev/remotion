// eslint-disable-next-line no-restricted-imports
import type {TCompMetadata} from 'remotion';
import {Log} from './log';
import {parsedCli} from './parse-command-line';
import {selectComposition} from './select-composition';

export const getCompositionId = async (validCompositions: TCompMetadata[]) => {
	if (parsedCli._[2]) {
		return parsedCli._[2];
	}

	if (!process.env.CI) {
		const selectedComposition = await selectComposition({
			multiple: false,
			validCompositions,
		});
		if (selectedComposition && typeof selectedComposition === 'string') {
			return selectedComposition;
		}
	}

	Log.error('Composition ID not passed.');
	Log.error('Pass an extra argument <composition-id>.');
	process.exit(1);
};
