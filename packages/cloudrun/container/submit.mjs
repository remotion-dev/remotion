import {execSync} from 'child_process';
import {writeFileSync} from 'fs';
import {VERSION} from 'remotion/version';

// Make an image with tag called `cachebase` - this contains all the layers until the JS gets copied
// If an earlier layer is changed, need to rebuild `cachebase` again

const cloudbuildJSON = {
	steps: [
		{
			name: 'gcr.io/cloud-builders/docker',
			entrypoint: 'bash',
			args: [
				'-c',
				`docker pull us-docker.pkg.dev/remotion-dev/cloud-run/render:cachebase || exit 0`,
			],
		},
		{
			name: 'gcr.io/cloud-builders/docker',
			args: [
				'build',
				'-t',
				`us-docker.pkg.dev/remotion-dev/cloud-run/render:${VERSION}`,
				'--cache-from',
				`us-docker.pkg.dev/remotion-dev/cloud-run/render:cachebase`,
				'.',
			],
		},
	],
	images: [`us-docker.pkg.dev/remotion-dev/cloud-run/render:${VERSION}`],
};

writeFileSync('cloudbuild.json', JSON.stringify(cloudbuildJSON, null, 2));

execSync(`gcloud builds submit --config cloudbuild.json .`, {
	stdio: 'inherit',
	env: {
		...process.env,
		VERSION,
	},
});
