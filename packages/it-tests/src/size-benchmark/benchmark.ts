import {exampleVideos} from '@remotion/example-videos';
import {getBenchmarks, saveBenchmark} from './persistance';
import {runBenchmark} from './run-benchmark';

const encoder = 'libx264';

const exampleVideo = exampleVideos.bigBuckBunny;

const crfsToTest = new Array(52).fill(true).map((_, i) => i);

for (let crf of crfsToTest) {
	const benchmarks = await getBenchmarks();
	const item = await runBenchmark({
		exampleVideo,
		qualityControl: {
			crf,
			type: 'crf',
		},
		encoder,
		benchmarks,
	});
	console.log(JSON.stringify(item));
	await saveBenchmark([...benchmarks, item]);
}
