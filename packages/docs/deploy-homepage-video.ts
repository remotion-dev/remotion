// bun deploy-homepage-video.ts
// Needs a .env
import type {AwsRegion} from '@remotion/lambda';
import {deploySite, getOrCreateBucket} from '@remotion/lambda';

const region: AwsRegion = 'us-west-2';

const {bucketName} = await getOrCreateBucket({
	region,
});

await deploySite({
	siteName: 'remotion-homepage',
	bucketName,
	entryPoint: './src/remotion/entry.ts',
	region,
});
