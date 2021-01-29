import minimist from 'minimist';
import {TCompMetadata} from 'remotion';

export const getCompositionId = (comps: TCompMetadata[]) => {
	const compositionId = minimist<{
		force: boolean;
	}>(process.argv.slice(2));
	if (!compositionId._[2]) {
		console.log(
			'Pass an extra argument <composition-id>. The following video names are available:'
		);
		console.log(`${comps.map((c) => c.id).join(', ')}`);
		process.exit(1);
	}
	return compositionId._[2];
};
