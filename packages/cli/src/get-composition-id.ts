import {TCompMetadata} from 'remotion';
import {Log} from './log';
import {parsedCli} from './parse-command-line';

export const getCompositionId = (comps: TCompMetadata[]) => {
	if (!parsedCli._[2]) {
		Log.Error('Composition ID not passed.');
		Log.Info(
			'Pass an extra argument <composition-id>. The following video names are available:'
		);
		Log.Info(`${comps.map((c) => c.id).join(', ')}`);
		process.exit(1);
	}
	return parsedCli._[2];
};
