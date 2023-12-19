import {
	getFunctions,
	getRenderProgress,
	renderMediaOnLambda,
} from '@remotion/lambda/client';
import assert from 'assert';
import {config} from 'dotenv';

config();

const [{functionName}] = await getFunctions({
	compatibleOnly: true,
	region: 'eu-central-1',
});

const timings = [];

for (let i = 0; i < 5; i++) {
	const startRender = Date.now();
	const {bucketName, renderId} = await renderMediaOnLambda({
		functionName,
		codec: 'h264',
		composition: 'OffthreadRemoteVideo',
		serveUrl: 'testbed-v6',
		region: 'eu-central-1',
	});

	let done = false;
	while (!done) {
		const progress = await getRenderProgress({
			bucketName,
			functionName,
			region: 'eu-central-1',
			renderId,
		});
		done = progress.done;
		console.log(progress.overallProgress);
		if (progress.fatalErrorEncountered) {
			console.log(progress.errors);
		}
		if (progress.done) {
			console.log(progress.outputFile);
		}
	}

	const end = Date.now();
	const time = end - startRender;
	timings.push(time);
	assert(time < 1000 * 45, `Render took too long (${time})`);
}
console.log('Times for 5 renders', timings);
