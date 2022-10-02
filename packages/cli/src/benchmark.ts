import {bundle} from '@remotion/bundler';
import type {RenderMediaOptions} from '@remotion/renderer';
import {getCompositions, renderMedia} from '@remotion/renderer';
import path from 'path';
import {Log} from './log';
import {parsedCli} from './parse-command-line';

const DEFUALT_RUNS = 3;
const DEFAULT_COMP_ID = 'Main';
const DEFAULT_FILE_PATH = './src/index';

const getValidCompositions = async (bundleLoc: string) => {
	const compositionArg: string = parsedCli.compositions ?? DEFAULT_COMP_ID;

	const comps = await getCompositions(bundleLoc);

	const ids = compositionArg.split(',').map((c) => c.trim());

	return ids.map((compId) => {
		const composition = comps.find((c) => c.id === compId);

		if (!composition) {
			throw new Error(`No composition with the ID "${compId}" found.`);
		}

		return composition;
	});
};

const getValidConcurrency = () => {
	const {concurrencies} = parsedCli;

	if (!concurrencies) {
		return undefined;
	}

	return (concurrencies as string)
		.split(',')
		.map((c) => parseInt(c.trim(), 10));
};

const runBenchmark = async (
	runs: number,
	options: RenderMediaOptions,
	onProgress?: (run: number, progress: number) => void
) => {
	const timeTaken: number[] = [];
	for (let run = 0; run < runs; ++run) {
		Log.info(`Rendering for ${run + 1}th run`);

		const startTime = performance.now();
		await renderMedia({
			...options,
			onProgress: ({progress}) => onProgress?.(run, progress),
		});
		const endTime = performance.now();

		timeTaken.push(endTime - startTime);
	}

	return timeTaken;
};

const formatTime = (time: number) => {
	let ret = '';
	const hours = Math.floor(time / (60 * 60 * 1000));
	if (hours) {
		ret = `${hours}h`;
	}

	time %= 60 * 60 * 1000;
	const minutes = Math.floor(time / (60 * 1000));

	if (minutes) {
		ret = `${ret}${minutes}m`;
	}

	time %= 60 * 1000;
	const seconds = (time / 1000).toFixed(5);

	if (seconds) {
		ret = `${ret}${seconds}s`;
	}

	return ret;
};

const avg = (time: number[]) =>
	time.reduce((prev, curr) => prev + curr) / time.length;

const logResults = (
	results: Record<string, Record<string, number[]>>,
	runs: number
) => {
	for (const compId in results) {
		if (Object.prototype.hasOwnProperty.call(results, compId)) {
			const comp = results[compId];

			Log.info(`Rendering time for ${compId} for ${runs} runs`);
			if (comp.default) {
				Log.info(`\tMax : ${formatTime(Math.max(...comp.default))}`);
				Log.info(`\tMin : ${formatTime(Math.min(...comp.default))}`);
				Log.info(`\tAverage : ${formatTime(avg(comp.default))}`);
			} else {
				for (const con in comp) {
					// eslint-disable-next-line max-depth
					if (Object.prototype.hasOwnProperty.call(comp, con)) {
						const concurrencyResult = comp[con];

						Log.info();
						Log.info(`\tConcurrency : ${con}`);
						Log.info(`\t\tMax : ${formatTime(Math.max(...concurrencyResult))}`);
						Log.info(`\t\tMin : ${formatTime(Math.min(...concurrencyResult))}`);
						Log.info(`\t\tAverage : ${formatTime(avg(concurrencyResult))}`);
					}
				}
			}
		}
	}
};

export const benchmarkCommand = async () => {
	const runs: number = parsedCli.runs ?? DEFUALT_RUNS;
	const filePath: string = parsedCli.filePath ?? DEFAULT_FILE_PATH;

	const bundleLocation = await bundle(path.resolve(filePath));

	const compositions = await getValidCompositions(bundleLocation);

	const benchmark: Record<string, Record<string, number[]>> = {};

	const concurrency = getValidConcurrency();

	for (const composition of compositions) {
		benchmark[composition.id] = {};
		if (concurrency) {
			for (const con of concurrency) {
				const timeTaken = await runBenchmark(runs, {
					codec: 'h264',
					composition,
					serveUrl: bundleLocation,
					concurrency: con,
				});

				benchmark[composition.id][`${con}`] = timeTaken;
			}
		} else {
			const timeTaken = await runBenchmark(runs, {
				codec: 'h264',
				composition,
				serveUrl: bundleLocation,
			});

			benchmark[composition.id].default = timeTaken;
		}
	}

	logResults(benchmark, runs);
};
