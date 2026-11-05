import {deployFunction} from '@remotion/lambda';
import {
	renderMediaOnLambdaAndStream,
	speculateFunctionName,
} from '@remotion/lambda-client';
import dotenv from 'dotenv';
dotenv.config({quiet: true});

await deployFunction({
	memorySizeInMb: 2048,
	diskSizeInMb: 2048,
	region: 'eu-central-1',
	timeoutInSeconds: 120,
	createCloudWatchLogGroup: true,
});

const functionName = speculateFunctionName({
	diskSizeInMb: 2048,
	memorySizeInMb: 2048,
	timeoutInSeconds: 120,
});

const result = await renderMediaOnLambdaAndStream({
	serveUrl: 'https://remotion-helloworld.vercel.app',
	functionName,
	composition: 'HelloWorld',
	region: 'eu-central-1',
	codec: 'h264',
	outName: {
		// TODO: Use the bucket name from your Supabase Storage settings
		bucketName: 'remotion-test-bucket',
		key: 'out.mp4',
		s3OutputProvider: {
			// FIXME: Use the endpoint from your Cloudflare Storage settings
			endpoint:
				'https://2fe488b3b0f4deee223aef7464784c46.r2.cloudflarestorage.com',
			// FIXME: Use the Access Key from your Cloudflare settings
			accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
			// FIXME: Use the Secret Access Key from your Cloudflare settings
			secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
		},
	},
	onInit: ({bucketName, renderId, cloudWatchMainLogs}) => {
		console.log(
			`Render started in bucket ${bucketName} with ID ${renderId}`,
			cloudWatchMainLogs,
		);
	},
	onProgress: ({overallProgress}) => {
		console.log(`Render progress ${overallProgress}`);
	},
});

console.log('Render finished!', result.outputFile);
