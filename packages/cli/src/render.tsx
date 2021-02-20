import {bundle} from '@remotion/bundler';
import {
	getActualConcurrency,
	getCompositions,
	renderFrames,
	stitchFramesToVideo,
	validateFfmpeg,
} from '@remotion/renderer';
import cliProgress from 'cli-progress';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {Internals} from 'remotion';
import {getFinalOutputCodec} from 'remotion/dist/config/codec';
import {getCompositionId} from './get-composition-id';
import {getConfigFileName} from './get-config-file-name';
import {getOutputFilename} from './get-filename';
import {getUserProps} from './get-user-props';
import {getImageFormat} from './image-formats';
import {loadConfigFile} from './load-config';
import {parseCommandLine} from './parse-command-line';
import {getUserPassedFileExtension} from './user-passed-output-location';

export const render = async () => {
	const args = process.argv;
	const file = args[3];
	const fullPath = path.join(process.cwd(), file);

	const configFileName = getConfigFileName();
	loadConfigFile(configFileName);
	parseCommandLine();
	const parallelism = Internals.getConcurrency();
	const shouldOutputImageSequence = Internals.getShouldOutputImageSequence();
	const userCodec = Internals.getOutputCodecOrUndefined();
	if (shouldOutputImageSequence && userCodec) {
		console.error(
			'Detected both --codec and --sequence (formerly --png) flag.'
		);
		console.error(
			'This is an error - no video codec can be used for image sequences.'
		);
		console.error('Remove one of the two flags and try again.');
		process.exit(1);
	}
	const codec = getFinalOutputCodec({
		codec: userCodec,
		fileExtension: getUserPassedFileExtension(),
		emitWarning: true,
	});
	const outputFile = getOutputFilename(codec, shouldOutputImageSequence);
	const overwrite = Internals.getShouldOverwrite();
	const userProps = getUserProps();
	const quality = Internals.getQuality();

	const absoluteOutputFile = path.resolve(process.cwd(), outputFile);
	if (fs.existsSync(absoluteOutputFile) && !overwrite) {
		console.log(
			`File at ${absoluteOutputFile} already exists. Use --overwrite to overwrite.`
		);
		process.exit(1);
	}
	if (shouldOutputImageSequence) {
		await validateFfmpeg();
	}
	const crf = shouldOutputImageSequence ? null : Internals.getActualCrf(codec);
	if (crf !== null) {
		Internals.validateSelectedCrf(crf, codec);
	}
	if (shouldOutputImageSequence) {
		fs.mkdirSync(absoluteOutputFile, {
			recursive: true,
		});
	}
	const steps = shouldOutputImageSequence ? 2 : 3;
	process.stdout.write(`📦 (1/${steps}) Bundling video...\n`);

	const bundlingProgress = new cliProgress.Bar(
		{
			clearOnComplete: true,
			format: '[{bar}] {percentage}%',
		},
		cliProgress.Presets.shades_grey
	);

	bundlingProgress.start(100, 0);

	const bundled = await bundle(fullPath, (f) => {
		bundlingProgress.update(f);
	});
	const comps = await getCompositions(bundled);
	const compositionId = getCompositionId(comps);

	bundlingProgress.stop();

	const config = comps.find((c) => c.id === compositionId);
	if (!config) {
		throw new Error(`Cannot find composition with ID ${compositionId}`);
	}

	const {durationInFrames: frames} = config;
	const outputDir = shouldOutputImageSequence
		? absoluteOutputFile
		: await fs.promises.mkdtemp(path.join(os.tmpdir(), 'react-motion-render'));

	const renderProgress = new cliProgress.Bar(
		{
			clearOnComplete: true,
			etaBuffer: 50,
			format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}',
		},
		cliProgress.Presets.shades_grey
	);
	const imageFormat = getImageFormat(codec);
	await renderFrames({
		config,
		onFrameUpdate: (f) => renderProgress.update(f),
		parallelism,
		compositionId,
		outputDir,
		onStart: () => {
			process.stdout.write(
				`📼 (2/${steps}) Rendering frames (${getActualConcurrency(
					parallelism
				)}x concurrency)...\n`
			);
			renderProgress.start(frames, 0);
		},
		userProps,
		webpackBundle: bundled,
		imageFormat,
		quality,
	});
	renderProgress.stop();
	if (process.env.DEBUG) {
		Internals.perf.logPerf();
	}
	if (!shouldOutputImageSequence) {
		process.stdout.write(`🧵 (3/${steps}) Stitching frames together...\n`);
		if (typeof crf !== 'number') {
			throw TypeError('CRF is unexpectedly not a number');
		}
		await stitchFramesToVideo({
			dir: outputDir,
			width: config.width,
			height: config.height,
			fps: config.fps,
			outputLocation: absoluteOutputFile,
			force: overwrite,
			imageFormat,
			pixelFormat: Internals.getPixelFormat(),
			codec,
			crf,
		});
		console.log('Cleaning up...');
		await fs.promises.rmdir(outputDir, {
			recursive: true,
		});
		console.log('\n▶️ Your video is ready - hit play!');
	} else {
		console.log('\n▶️ Your image sequence is ready!');
	}
	console.log(absoluteOutputFile);
};
