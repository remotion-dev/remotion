/* eslint-disable no-undef */
import {
	getRenderProgress,
	renderMediaOnLambda,
	speculateFunctionName,
} from '@remotion/lambda/client';
import dotenv from 'dotenv';
dotenv.config();

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
			// TODO: Use the endpoint from your Supabase Storage settings
			endpoint: 'https://kudbuxgvpedqabsivqjz.supabase.co/storage/v1/s3',
			// TODO: Use the Access Key from your Supabase Storage settings
			accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID ?? '',
			// TODO: Use the Secret Access Key from your Supabase Storage settings
			secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY ?? '',
			// TODO: Use the region from your Supabase Storage settings
			region: 'eu-central-1',
			forcePathStyle: true,
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
