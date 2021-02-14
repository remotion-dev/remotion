import {TCompMetadata} from 'remotion';
import {parsedCli} from './parse-command-line';

export const getCompositionId = (comps: TCompMetadata[]) => {
	if (!parsedCli._[2]) {
		console.log(
			'Pass an extra argument <composition-id>. The following video names are available:'
		);
		console.log(`${comps.map((c) => c.id).join(', ')}`);
		process.exit(1);
	}
	return parsedCli._[2];
};
