import type {RenderMediaOptions} from '@remotion/renderer';
import {
	getCompositions,
	RenderInternals,
	renderMedia,
} from '@remotion/renderer';
import path from 'path';
import {chalk} from './chalk';
import {getFinalCodec} from './get-cli-options';
import {getRenderMediaOptions} from './get-render-media-options';
import {Log} from './log';
import {makeProgressBar} from './make-progress-bar';
import {parsedCli, quietFlagProvided} from './parse-command-line';
import {createOverwriteableCliOutput} from './progress-bar';
import {bundleOnCli} from './setup-cache';
import {truthy} from './truthy';

const DEFAULT_RUNS = 3;

const getValidCompositions = async (
	bundleLoc: string,
	compositionArg: string
) => {
	const comps = await getCompositions(bundleLoc);

	const ids = (compositionArg ?? '')
		.split(',')
		.map((c) => c.trim())
		.filter(truthy);

	return ids.map((compId) => {
		const composition = comps.find((c) => c.id === compId);

		if (!composition) {
			throw new Error(`No composition with the ID "${compId}" found.`);
		}

		return composition;
	});
};

const getValidConcurrency = (renderMediaOptions: RenderMediaOptions) => {
	const concurrency =
		'concurrency' in renderMediaOptions
			? renderMediaOptions.concurrency ?? null
			: null;

	const {concurrencies} = parsedCli;

	if (!concurrencies) {
		return [RenderInternals.getActualConcurrency(concurrency)];
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

const stdDev = (time: number[]) => {
	const mean = avg(time);
	return Math.sqrt(
		time.map((x) => (x - mean) ** 2).reduce((a, b) => a + b) / time.length
	);
};

const getResults = (results: number[], runs: number) => {
	const mean = avg(results);
	const dev = stdDev(results);
	const max = Math.max(...results);
	const min = Math.min(...results);

	return `    Time (${chalk.green('mean')} ± ${chalk.green(
		'σ'
	)}):         ${chalk.green(formatTime(mean))} ± ${chalk.green(
		formatTime(dev)
	)}\n    Range (${chalk.blue('min')} ... ${chalk.red(
		'max'
	)}):     ${chalk.blue(formatTime(min))} ... ${chalk.red(
		formatTime(max)
	)} \t ${chalk.gray(`${runs} runs`)}
	`;
};

type BenchmarkProgressBarOptions = {
	totalRuns: number;
	run: number;
	progress: number;
	doneIn: string | null;
};

const makeBenchmarkProgressBar = ({
	totalRuns,
	run,
	progress,
	doneIn,
}: BenchmarkProgressBarOptions) => {
	const totalProgress = (run + progress) / totalRuns;

	return [
		`Rendering (${run + 1} out of ${totalRuns} runs)`,
		makeProgressBar(totalProgress),
		doneIn === null
			? `${(totalProgress * 100).toFixed(2)}% `
			: chalk.gray(doneIn),
	].join(' ');
};

export const benchmarkCommand = async (
	remotionRoot: string,
	args: string[]
) => {
	const runs: number = parsedCli.runs ?? DEFAULT_RUNS;

	const filePath = args[0];

	if (!filePath) {
		Log.error('No entry file passed.');
		Log.info('Pass an additional argument specifying the entry file');
		Log.info();
		Log.info(`$ remotion benchmark <entry file>`);
		process.exit(1);
	}

	const fullPath = path.join(process.cwd(), filePath);

	const bundleLocation = await bundleOnCli({
		fullPath,
		publicDir: null,
		remotionRoot,
		steps: ['bundling'],
	});

	const compositions = await getValidCompositions(bundleLocation, args[1]);

	if (compositions.length === 0) {
		Log.error(
			'No composition IDs passed. Add another argument to the command specifying at least 1 composition ID.'
		);
	}

	const benchmark: Record<string, Record<string, number[]>> = {};

	let count = 1;

	const {codec, reason: codecReason} = getFinalCodec({
		downloadName: null,
		outName: null,
	});

	for (const composition of compositions) {
		const renderMediaOptions = await getRenderMediaOptions({
			config: composition,
			outputLocation: undefined,
			serveUrl: bundleLocation,
			codec,
		});
		const concurrency = getValidConcurrency(renderMediaOptions);

		benchmark[composition.id] = {};
		for (const con of concurrency) {
			const benchmarkProgress = createOverwriteableCliOutput(
				quietFlagProvided()
			);
			Log.info();
			Log.info(
				`${chalk.bold(`Benchmark #${count++}:`)} ${chalk.gray(
					`composition=${composition.id} concurrency=${con} codec=${codec} (${codecReason})`
				)}`
			);

			const timeTaken = await runBenchmark(
				runs,
				{
					...renderMediaOptions,
					concurrency: con,
				},
				(run, progress) => {
					benchmarkProgress.update(
						makeBenchmarkProgressBar({
							totalRuns: runs,
							run,
							doneIn: null,
							progress,
						})
					);
				}
			);

			benchmarkProgress.update('');
			benchmarkProgress.update(getResults(timeTaken, runs));

			benchmark[composition.id][`${con}`] = timeTaken;
		}
	}

	Log.info();
};
