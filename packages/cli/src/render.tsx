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
import {getCompositionId} from './get-composition-id';
import {getConfigFileName} from './get-config-file-name';
import {getOutputFilename} from './get-filename';
import {getUserProps} from './get-user-props';
import {getFrameFormat} from './image-formats';
import {loadConfigFile} from './load-config';
import {parseCommandLine} from './parse-command-line';

export const render = async () => {
	const args = process.argv;
	const file = args[3];
	const fullPath = path.join(process.cwd(), file);

	const configFileName = getConfigFileName();
	loadConfigFile(configFileName);
	parseCommandLine();
	const parallelism = Internals.getConcurrency();
	const renderMode = Internals.getOutputFormat();
	const outputFile = getOutputFilename(renderMode);
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
	if (
		renderMode === 'mp4' ||
		renderMode === 'webm-v8' ||
		renderMode === 'webm-v9'
	) {
		await validateFfmpeg();
	}
	if (renderMode === 'png') {
		fs.mkdirSync(absoluteOutputFile, {
			recursive: true,
		});
	}
	const steps = renderMode === 'png' ? 2 : 3;
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
	const outputDir =
		renderMode === 'png'
			? absoluteOutputFile
			: await fs.promises.mkdtemp(
					path.join(os.tmpdir(), 'react-motion-render')
			  );

	const renderProgress = new cliProgress.Bar(
		{
			clearOnComplete: true,
			etaBuffer: 50,
			format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}',
		},
		cliProgress.Presets.shades_grey
	);
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
		imageFormat: getFrameFormat(renderMode),
		quality,
	});
	renderProgress.stop();
	if (process.env.DEBUG) {
		Internals.perf.logPerf();
	}
	if (
		renderMode === 'mp4' ||
		renderMode === 'webm-v8' ||
		renderMode === 'webm-v9'
	) {
		process.stdout.write(`🧵 (3/${steps}) Stitching frames together...\n`);
		await stitchFramesToVideo({
			dir: outputDir,
			width: config.width,
			height: config.height,
			fps: config.fps,
			outputLocation: absoluteOutputFile,
			force: overwrite,
			imageFormat: getFrameFormat(renderMode),
			pixelFormat: Internals.getPixelFormat(),
			outputFormat: Internals.getOutputFormat(),
		});
		console.log('Cleaning up...');
		await fs.promises.rmdir(outputDir, {
			recursive: true,
		});
		console.log('\n▶️ Your video is ready - hit play!');
	} else {
		console.log('\n▶️ Your PNG sequence is ready!');
	}
	console.log(absoluteOutputFile);
};
