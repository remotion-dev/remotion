import {execSync} from 'child_process';
import {existsSync, rmSync, writeFileSync} from 'fs';
import {VERSION} from 'remotion/version';
import {build} from './build.mjs';

if (
	!['development', 'production'].includes(process.env.ARTIFACT_REGISTRY_ENV)
) {
	throw new Error(
		`ARTIFACT_REGISTRY_ENV is ${process.env.ARTIFACT_REGISTRY_ENV}, but it should be either 'development' or 'production'`,
	);
}

if (existsSync('./ensure-browser.mjs')) {
	rmSync('./ensure-browser.mjs', {
		force: true,
	});
}

build();

const isCached = process.argv.includes('--cached');
if (isCached) {
	// eslint-disable-next-line no-console
	console.log('Creating cacheed image');
}

// Make an image with tag called `cachebase` - this contains all the layers until the JS gets copied
// If an earlier layer is changed, need to rebuild `cachebase` again

const cacheTag = 'us-docker.pkg.dev/remotion-dev/development/render:cachebase';

const tag = isCached
	? cacheTag
	: `us-docker.pkg.dev/remotion-dev/${process.env.ARTIFACT_REGISTRY_ENV}/render:${VERSION}`;

const cloudbuildJSON = {
	steps: [
		{
			name: 'gcr.io/cloud-builders/docker',
			entrypoint: 'bash',
			args: ['-c', `docker pull ${cacheTag} || exit 0`],
		},
		{
			name: 'gcr.io/cloud-builders/docker',
			args: [
				'build',
				'-t',
				tag,
				isCached ? null : '--cache-from',
				isCached
					? null
					: `us-docker.pkg.dev/remotion-dev/${process.env.ARTIFACT_REGISTRY_ENV}/render:cachebase`,
				'.',
			].filter(Boolean),
		},
	],
	images: [tag],
};

writeFileSync('cloudbuild.json', JSON.stringify(cloudbuildJSON, null, 2));

execSync(`gcloud builds submit --config cloudbuild.json .`, {
	stdio: 'inherit',
	env: {
		...process.env,
		VERSION,
	},
});
