import {Log} from './log';
import {parsedCli} from './parse-command-line';

export const getCompositionId = () => {
	if (!parsedCli._[2]) {
		Log.error('Composition ID not passed.');
		Log.error('Pass an extra argument <composition-id>.');
		process.exit(1);
	}

	return parsedCli._[2];
};
