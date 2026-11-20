import {getSilentParts} from '@remotion/renderer';

getSilentParts({src: process.argv[2]}).then((result) => {
	console.log(String(result.durationInSeconds));
});
