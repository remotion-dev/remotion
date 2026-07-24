// bun deploy-homepage-video.ts
// Needs a .env
import {bundle} from '@remotion/bundler';
import type {AwsRegion} from '@remotion/lambda';
import {deploySiteFromBundle, getOrCreateBucket} from '@remotion/lambda';

const region: AwsRegion = 'us-west-2';

// @ts-expect-error
const {bucketName} = await getOrCreateBucket({
	region,
});

if (!process.env.REMOTION_AWS_ACCESS_KEY_ID?.endsWith('KQHJ')) {
	throw new Error('Please fill in your AWS credentials in .env');
}

const bundleDir = await bundle({entryPoint: './src/remotion/entry.ts'});

// @ts-expect-error
const {serveUrl} = await deploySiteFromBundle({
	siteName: 'remotion-homepage',
	bucketName,
	bundleDir,
	region,
});

console.log(serveUrl);
