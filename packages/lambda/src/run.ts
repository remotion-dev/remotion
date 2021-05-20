import {CliInternals} from '@remotion/cli';
import {writeFileSync} from 'fs';
import path from 'path';
import {lambdaClient, s3Client} from './aws-clients';
import {callLambda} from './call-lambda';
import {checkLambdaStatus} from './check-lambda-status';
import {cleanupLambdas, getRemotionLambdas} from './cleanup/cleanup-lambdas';
import {cleanUpBuckets, getRemotionS3Buckets} from './cleanup/s3-buckets';
import {
	LambdaRoutines,
	LAMBDA_INITIALIZED_KEY,
	LAMBDA_S3_WEBSITE_DEPLOY,
} from './constants';
import {createLambda} from './create-lambda';
import {deploySite} from './deploy-site';
import {lambdaLs, lambdaReadFile} from './io';
import {makeS3Url} from './make-s3-url';
import {sleep} from './sleep';
import {streamToString} from './stream-to-string';

const DEPLOY = false;

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
	const websiteBuckets = remotionBuckets.filter((b) =>
		b.startsWith(LAMBDA_S3_WEBSITE_DEPLOY)
	);
	return {
		functionName: lambdas[0].FunctionName as string,
		bucketUrl: makeS3Url('remotion-bucket-0.015890651294784286'),
	};
};

CliInternals.xns(async () => {
	const {functionName, bucketUrl} = await getFnName();
	const res = await callLambda({
		functionName,
		type: LambdaRoutines.start,
		payload: {
			chunkSize: 20,
			composition: 'Main',
			serveUrl: bucketUrl,
			inputProps: {},
		},
	});
	console.log(bucketUrl);
	for (let i = 0; i < 3000; i++) {
		await sleep(1000);
		const status = await checkLambdaStatus(functionName, res.bucketName);
		console.log(status);
		if (status.done) {
			console.log('Done! ' + res.bucketName);
			break;
		}
	}

	const files = await lambdaLs({
		bucketName: res.bucketName,
		forceS3: true,
	});
	const logs = files.filter((f) => f.Key?.startsWith(LAMBDA_INITIALIZED_KEY));

	for (const log of logs) {
		const content = await lambdaReadFile({
			bucketName: res.bucketName,
			key: log.Key as string,
		});
		writeFileSync(log.Key as string, await streamToString(content));
	}
});
