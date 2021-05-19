import {CliInternals} from '@remotion/cli';
import path from 'path';
import {lambdaClient, s3Client} from './aws-clients';
import {callLambda} from './call-lambda';
import {checkLambdaStatus} from './check-lambda-status';
import {cleanupLambdas, getRemotionLambdas} from './cleanup/cleanup-lambdas';
import {cleanUpBuckets, getRemotionS3Buckets} from './cleanup/s3-buckets';
import {LambdaRoutines} from './constants';
import {createLambda} from './create-lambda';
import {deploySite} from './deploy-site';
import {makeS3Url} from './make-s3-url';
import {sleep} from './sleep';

const DEPLOY = true;

const getFnName = async (): Promise<{
	functionName: string;
	bucketUrl: string;
}> => {
	if (DEPLOY) {
		await cleanupLambdas({lambdaClient});
		await cleanUpBuckets({s3client: s3Client});

		const {functionName} = await createLambda();

		const {url} = await deploySite(
			path.join(__dirname, '..', 'remotion-project', 'index.ts'),
			{
				// TODO: Start uploading lambda now
				onBucketCreated: async () => {},
			}
		);

		return {functionName, bucketUrl: url};
	}

	const lambdas = await getRemotionLambdas(lambdaClient);
	const {remotionBuckets} = await getRemotionS3Buckets(s3Client);
	return {
		functionName: lambdas[0].FunctionName as string,
		bucketUrl: makeS3Url(remotionBuckets[0] as string),
	};
};

CliInternals.xns(async () => {
	const {functionName, bucketUrl} = await getFnName();
	const res = await callLambda({
		functionName,
		type: LambdaRoutines.start,
		payload: {
			chunkSize: 20,
			composition: 'my-video',
			serveUrl: bucketUrl,
			inputProps: {
				duration: 1000,
			},
		},
	});
	for (let i = 0; i < 3000; i++) {
		await sleep(1000);
		const status = await checkLambdaStatus(functionName, res.bucketName);
		console.log(status);
		if (status.done) {
			console.log('Done! ' + res.bucketName);
			process.exit(0);
		}
	}
});
