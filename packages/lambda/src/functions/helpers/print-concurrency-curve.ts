import {bestFramesPerLambdaParam} from './best-frames-per-lambda-param';

const entries: [number, number][] = [];

for (let i = 0; i < 18000; i += 100) {
	entries.push([i, bestFramesPerLambdaParam(i)]);
}

console.log(entries.map((e) => e.join(',')).join('\n'));
