import xns from 'xns';
import {callLambda} from './call-lambda';
import {checkLambdaStatus} from './check-lambda-status';
import {cleanUpBuckets} from './cleanup-buckets';
import {cleanupLambdas} from './cleanup-lambdas';
import {LambdaRoutines} from './constants';
import {createLambda} from './create-lambda';
import {sleep} from './sleep';

xns(async () => {
	await cleanupLambdas();
	await cleanUpBuckets();
	const {functionName, bucketUrl} = await createLambda();

	const res = await callLambda({
		functionName,
		type: LambdaRoutines.start,
		payload: {
			chunkSize: 20,
			composition: 'my-video',
			durationInFrames: 200,
			serveUrl: bucketUrl,
		},
	});
	console.log(res);
	for (let i = 0; i < 30; i++) {
		await sleep(1000);
		console.log(await checkLambdaStatus(functionName, res.bucketName));
	}
});
