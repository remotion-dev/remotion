import type {RenderMediaOptions} from '@remotion/renderer';
import {getCompositions, renderMedia} from '@remotion/renderer';
import path from 'path';
import {chalk} from './chalk';
import {Log} from './log';
import {makeProgressBar} from './make-progress-bar';
import {parsedCli, quietFlagProvided} from './parse-command-line';
import {createOverwriteableCliOutput} from './progress-bar';
import {bundleOnCli} from './setup-cache';

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
				Log.info(
					`  Max : ${chalk.bold(formatTime(Math.max(...comp.default)))}`
				);
				Log.info(
					`  Min : ${chalk.bold(formatTime(Math.min(...comp.default)))}`
				);
				Log.info(`  Average : ${chalk.bold(formatTime(avg(comp.default)))}`);
			} else {
				for (const con in comp) {
					// eslint-disable-next-line max-depth
					if (Object.prototype.hasOwnProperty.call(comp, con)) {
						const concurrencyResult = comp[con];

						Log.info();
						Log.info(`  Concurrency : ${con}`);
						Log.info(
							`    Max : ${chalk.bold(
								formatTime(Math.max(...concurrencyResult))
							)}`
						);
						Log.info(
							`    Min : ${chalk.bold(
								formatTime(Math.min(...concurrencyResult))
							)}`
						);
						Log.info(
							`    Average : ${chalk.bold(formatTime(avg(concurrencyResult)))}`
						);
					}
				}
			}
		}
	}
};

type BenchmarkProgressBarOptions = {
	totalRuns: number;
	run: number;
	progress: number;
	concurrency: number | null;
	compId: string;
	doneIn: string | null;
};

const makeBenchmarkProgressBar = ({
	totalRuns,
	run,
	progress,
	doneIn,
	compId,
	concurrency,
}: BenchmarkProgressBarOptions) => {
	const totalProgress = (run + progress) / totalRuns;

	return [
		`(2/2)`,
		makeProgressBar(totalProgress),
		doneIn === null
			? `Rendering ${compId} frames${
					concurrency === null ? '' : `(${concurrency}x)`
			  }`
			: `Rendered ${compId} ${totalRuns} times`,
		doneIn === null
			? `${(totalProgress * 100).toFixed(2)}% ${chalk.gray(
					` ${run + 1}th run`
			  )}`
			: chalk.gray(doneIn),
	].join(' ');
};

export const benchmarkCommand = async (remotionRoot: string) => {
	const runs: number = parsedCli.runs ?? DEFUALT_RUNS;
	const filePath: string = parsedCli.filePath ?? DEFAULT_FILE_PATH;

	const fullPath = path.join(process.cwd(), filePath);

	const bundleLocation = await bundleOnCli({
		fullPath,
		publicDir: null,
		remotionRoot,
		steps: ['bundling', 'rendering'],
	});

	const compositions = await getValidCompositions(bundleLocation);

	const benchmark: Record<string, Record<string, number[]>> = {};

	const concurrency = getValidConcurrency();

	for (const composition of compositions) {
		if (composition !== compositions[0]) {
			Log.info();
		}

		const benchmarkProgress = createOverwriteableCliOutput(quietFlagProvided());

		const start = Date.now();

		benchmark[composition.id] = {};
		if (concurrency) {
			for (const con of concurrency) {
				const timeTaken = await runBenchmark(
					runs,
					{
						codec: 'h264',
						composition,
						serveUrl: bundleLocation,
						concurrency: con,
					},
					(run, progress) => {
						benchmarkProgress.update(
							makeBenchmarkProgressBar({
								totalRuns: runs,
								run,
								compId: composition.id,
								concurrency: con,
								doneIn: null,
								progress,
							})
						);
					}
				);

				benchmark[composition.id][`${con}`] = timeTaken;
			}
		} else {
			const timeTaken = await runBenchmark(
				runs,
				{
					codec: 'h264',
					composition,
					serveUrl: bundleLocation,
				},
				(run, progress) => {
					benchmarkProgress.update(
						makeBenchmarkProgressBar({
							totalRuns: runs,
							run,
							compId: composition.id,
							concurrency: null,
							doneIn: null,
							progress,
						})
					);
				}
			);
			benchmarkProgress.update(
				makeBenchmarkProgressBar({
					totalRuns: runs,
					run: runs - 1,
					compId: composition.id,
					concurrency: null,
					doneIn: formatTime(Date.now() - start),
					progress: 1,
				})
			);

			benchmark[composition.id].default = timeTaken;
		}
	}

	Log.info();
	logResults(benchmark, runs);
};
