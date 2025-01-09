import {exampleVideos} from '@remotion/example-videos';
import path from 'path';
import {getQualityControlModesForEncoder} from './get-quality-control-modes';
import {getBenchmarks, hasBenchmark, saveBenchmark} from './persistance';
import {runBenchmark} from './run-benchmark';
import {encoders, getBenchmarkKey, printBenchmark} from './types';

const videos = [exampleVideos.bigBuckBunny, exampleVideos.iphonevideo];

for (const video of videos) {
	for (const encoder of encoders) {
		for (let qualityControl of getQualityControlModesForEncoder(encoder)) {
			const benchmarks = await getBenchmarks();
			const filename = path.basename(video);
			const key = getBenchmarkKey({
				filename,
				encoder,
				qualityControl,
			});

			const found = hasBenchmark(benchmarks, key);
			if (found) {
				printBenchmark(found);
				continue;
			}

			const item = await runBenchmark({
				exampleVideo: video,
				qualityControl,
				encoder,
				benchmarks,
			});
			printBenchmark(item);
			await saveBenchmark([...benchmarks, item]);
		}
	}
}
