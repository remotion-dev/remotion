import minimist from 'minimist';
import {TCompMetadata} from 'remotion';

export const getVideoId = (comps: TCompMetadata[]) => {
	const videoName = minimist<{
		force: boolean;
	}>(process.argv.slice(2));
	if (!videoName._[2]) {
		console.log(
			'Pass an extra argument <video-name>. The following video names are available:'
		);
		console.log(`${comps.map((c) => c.id).join(', ')}`);
		process.exit(1);
	}
	return videoName._[2];
};
