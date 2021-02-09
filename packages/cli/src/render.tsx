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
import {getCompositionId} from './get-composition-id';
import {getConcurrency} from './get-concurrency';
import {getConfigFileName} from './get-config-file-name';
import {getOutputFilename} from './get-filename';
import {getOverwrite} from './get-overwrite';
import {getRenderMode} from './get-render-mode';
import {getUserProps} from './get-user-props';
import {loadConfigFile} from './load-config';

export const render = async () => {
	const args = process.argv;
	const file = args[3];
	const fullPath = path.join(process.cwd(), file);

	const parallelism = getConcurrency();
	const renderMode = getRenderMode();
	const outputFile = getOutputFilename();
	const overwrite = getOverwrite();
	const userProps = getUserProps();
	const configFileName = getConfigFileName();

	loadConfigFile(configFileName);

	const absoluteOutputFile = path.resolve(process.cwd(), outputFile);
	if (fs.existsSync(absoluteOutputFile) && !overwrite) {
		console.log(
			`File at ${absoluteOutputFile} already exists. Use --overwrite to overwrite.`
		);
		process.exit(1);
	}
	if (renderMode === 'mp4') {
		await validateFfmpeg();
	}
	if (renderMode === 'png-sequence') {
		fs.mkdirSync(absoluteOutputFile, {
			recursive: true,
		});
	}
	const steps = renderMode === 'png-sequence' ? 2 : 3;
	process.stdout.write(`📦 (1/${steps}) Bundling video...\n`);

	const bundled = await bundle(fullPath);
	const comps = await getCompositions(bundled);
	const compositionId = getCompositionId(comps);

	const config = comps.find((c) => c.id === compositionId);
	if (!config) {
		throw new Error(`Cannot find composition with ID ${compositionId}`);
	}

	const {durationInFrames: frames} = config;
	const outputDir =
		renderMode === 'png-sequence'
			? absoluteOutputFile
			: await fs.promises.mkdtemp(
					path.join(os.tmpdir(), 'react-motion-render')
			  );
	const bar = new cliProgress.Bar(
		{clearOnComplete: true},
		cliProgress.Presets.shades_grey
	);
	await renderFrames({
		config,
		onFrameUpdate: (f) => bar.update(f),
		parallelism,
		compositionId,
		outputDir,
		onStart: () => {
			process.stdout.write(
				`📼 (2/${steps}) Rendering frames (${getActualConcurrency(
					parallelism
				)}x concurrency)...\n`
			);
			bar.start(frames, 0);
		},
		userProps,
		webpackBundle: bundled,
	});
	bar.stop();
	if (renderMode === 'mp4') {
		process.stdout.write(`🧵 (3/${steps}) Stitching frames together...\n`);
		await stitchFramesToVideo({
			dir: outputDir,
			width: config.width,
			height: config.height,
			fps: config.fps,
			outputLocation: absoluteOutputFile,
			force: overwrite,
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
