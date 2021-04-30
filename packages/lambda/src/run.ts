import xns from 'xns';
import {callLambda} from './call-lambda';
import {cleanUpBuckets} from './cleanup-buckets';
import {cleanupLambdas} from './cleanup-lambdas';
import {createLambda} from './create-lambda';

xns(async () => {
	await cleanupLambdas();
	await cleanUpBuckets();
	const {functionName, bucketUrl} = await createLambda();

	const res = await callLambda(functionName, {
		type: 'init',
		chunkSize: 20,
		composition: 'my-video',
		durationInFrames: 200,
		serveUrl: bucketUrl,
	});
	console.log(res);
});
