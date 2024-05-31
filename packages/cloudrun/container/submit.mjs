import {execSync} from 'child_process';
import {writeFileSync} from 'fs';
import {VERSION} from 'remotion/version';

if (
	!['development', 'production'].includes(process.env.ARTIFACT_REGISTRY_ENV)
) {
	throw new Error(
		`ARTIFACT_REGISTRY_ENV is ${process.env.ARTIFACT_REGISTRY_ENV}, but it should be either 'development' or 'production'`,
	);
}

// Make an image with tag called `cachebase` - this contains all the layers until the JS gets copied
// If an earlier layer is changed, need to rebuild `cachebase` again

const cloudbuildJSON = {
	steps: [
		{
			name: 'gcr.io/cloud-builders/docker',
			entrypoint: 'bash',
			args: [
				'-c',
				`docker pull us-docker.pkg.dev/remotion-dev/${process.env.ARTIFACT_REGISTRY_ENV}/render:cachebase || exit 0`,
			],
		},
		{
			name: 'gcr.io/cloud-builders/docker',
			args: [
				'build',
				'-t',
				`us-docker.pkg.dev/remotion-dev/${process.env.ARTIFACT_REGISTRY_ENV}/render:${VERSION}`,
				'--cache-from',
				`us-docker.pkg.dev/remotion-dev/${process.env.ARTIFACT_REGISTRY_ENV}/render:cachebase`,
				'.',
			],
		},
	],
	images: [
		`us-docker.pkg.dev/remotion-dev/${process.env.ARTIFACT_REGISTRY_ENV}/render:${VERSION}`,
	],
};

writeFileSync('cloudbuild.json', JSON.stringify(cloudbuildJSON, null, 2));

execSync(`gcloud builds submit --config cloudbuild.json .`, {
	stdio: 'inherit',
	env: {
		...process.env,
		VERSION,
	},
});
