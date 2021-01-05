import minimist from 'minimist';
import {TComposition} from 'remotion';

export const getVideoName = (comps: TComposition<unknown>[]) => {
	const videoName = minimist<{
		force: boolean;
	}>(process.argv.slice(2));
	if (!videoName._[0]) {
		console.log(
			'Pass an extra argument <video-name>. The following video names are available:'
		);
		console.log(`${comps.map((c) => c.id).join(', ')}`);
		process.exit(1);
	}
	return videoName._[0];
};
