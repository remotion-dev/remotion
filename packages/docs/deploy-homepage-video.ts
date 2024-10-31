// bun deploy-homepage-video.ts
// Needs a .env
import type {AwsRegion} from '@remotion/lambda';
import {deploySite, getOrCreateBucket} from '@remotion/lambda';

const region: AwsRegion = 'us-west-2';

// @ts-expect-error
const {bucketName} = await getOrCreateBucket({
	region,
});

if (!process.env.REMOTION_AWS_ACCESS_KEY_ID?.endsWith('KQHJ')) {
	throw new Error('Please fill in your AWS credentials in .env');
}

// @ts-expect-error
const {serveUrl} = await deploySite({
	siteName: 'remotion-homepage',
	bucketName,
	entryPoint: './src/remotion/entry.ts',
	region,
});

console.log(serveUrl);
