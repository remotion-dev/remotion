import console from 'node:console';
import {
	getFunctions,
	renderMediaOnLambdaAndStream,
} from '@remotion/lambda/client';
import assert from 'assert';
import {config} from 'dotenv';

config({quiet: true});

const [{functionName}] = await getFunctions({
	compatibleOnly: true,
	region: 'eu-central-1',
});

const timings = [];

for (let i = 0; i < 5; i++) {
	const startRender = Date.now();
	const result = await renderMediaOnLambdaAndStream({
		functionName,
		codec: 'h264',
		composition: 'OffthreadRemoteVideo',
		serveUrl: 'testbed-v6',
		region: 'eu-central-1',
		onProgress: ({overallProgress}) => {
			console.log(overallProgress);
		},
	});

	console.log(result.outputFile);

	const end = Date.now();
	const time = end - startRender;
	timings.push(time);
	assert(time < 1000 * 45, `Render took too long (${time})`);
}
console.log('Times for 5 renders', timings);
