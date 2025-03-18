/* eslint-disable no-undef */
import {deployFunction} from '@remotion/lambda';
import {
	getRenderProgress,
	renderMediaOnLambda,
	speculateFunctionName,
} from '@remotion/lambda-client';
import dotenv from 'dotenv';
dotenv.config();

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

const {bucketName, renderId, cloudWatchMainLogs} = await renderMediaOnLambda({
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
});

console.log(
	`Render initiated it is in this bucket=${bucketName} and the id=${renderId}`,
	cloudWatchMainLogs,
);

while (true) {
	const {overallProgress, errors, done, fatalErrorEncountered} =
		await getRenderProgress({
			renderId: renderId,
			bucketName: bucketName,
			functionName: functionName,
			region: 'eu-central-1',
		});
	if (fatalErrorEncountered) {
		console.error(errors);
		break;
	}
	if (done) {
		break;
	}

	console.log(`Render progress ${overallProgress}`);
	console.log(errors);
}
