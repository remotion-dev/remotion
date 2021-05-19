import {CliInternals} from '@remotion/cli';
import {lambdaClient, s3Client} from './aws-clients';
import {callLambda} from './call-lambda';
import {checkLambdaStatus} from './check-lambda-status';
import {cleanupLambdas} from './cleanup/cleanup-lambdas';
import {cleanUpBuckets} from './cleanup/s3-buckets';
import {LambdaRoutines} from './constants';
import {createLambda} from './create-lambda';
import {sleep} from './sleep';

CliInternals.xns(async () => {
	await cleanupLambdas({lambdaClient});
	await cleanUpBuckets({s3client: s3Client});
	const {functionName, bucketUrl} = await createLambda();

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
