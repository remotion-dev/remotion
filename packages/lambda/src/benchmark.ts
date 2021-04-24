import {InvokeCommand, LambdaClient} from '@aws-sdk/client-lambda';
import xns from 'xns';
import {REGION} from './constants';

const lambdaClient = new LambdaClient({
	region: REGION,
});

const toTest = [12, 10, 15, 20, 100];
const runs = [1, 2, 3, 4, 5];

export const benchmark = xns(async () => {
	for (const chunkSize of toTest) {
		for (const run of runs) {
			const id = `invoking with  ${chunkSize},run ${run}/${runs.length}`;
			console.time(id);
			const res = await lambdaClient.send(
				new InvokeCommand({
					FunctionName: 'remotion-render-test-13590610360717514',
					// @ts-expect-error
					Payload: JSON.stringify({
						serveUrl:
							'http://remotion-bucket-0.7941138461348309.s3.eu-central-1.amazonaws.com',
						type: 'init',
						composition: 'my-video',
						chunkSize,
					}),
				})
			);
			console.timeEnd(id);
			console.log(res.LogResult);
		}
	}
});
