import {
	renderFrames,
	stitchFramesToVideo,
	validateFfmpeg,
} from '@remotion/renderer';
import cliProgress from 'cli-progress';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {TComposition, VideoConfig} from 'remotion';
import {getConcurrency} from './get-concurrency';
import {getOutputFilename} from './get-filename';
import {getOverwrite} from './get-overwrite';
import {getRenderMode} from './get-render-mode';
import {getVideoName} from './get-video-name';

export const render = async (fullPath: string, comps: TComposition[]) => {
	const parallelism = getConcurrency();
	const renderMode = getRenderMode();
	const outputFile = getOutputFilename();
	const overwrite = getOverwrite();
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
	process.stdout.write('📦 (1/3) Bundling video...\n');
	const videoName = getVideoName(comps);
	const comp = comps.find((c) => c.name === videoName);

	if (!comp) {
		console.log(
			`Could not find video with the name ${videoName}. The following videos are available: `
		);
		console.log(`${comps.map((c) => c.name).join(', ')}`);
		process.exit(1);
	}
	const config: VideoConfig = {
		durationInFrames: comp.durationInFrames,
		fps: comp.fps,
		height: comp.height,
		width: comp.width,
	};

	const {durationInFrames: frames} = config;
	const outputDir = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'react-motion-render')
	);
	const bar = new cliProgress.Bar(
		{clearOnComplete: true},
		cliProgress.Presets.shades_grey
	);
	await renderFrames({
		fullPath,
		config,
		onFrameUpdate: (f) => bar.update(f),
		parallelism,
		videoName,
		outputDir,
		onStart: () => {
			process.stdout.write(
				`📼 (2/3) Rendering frames (${parallelism}x concurrency)...\n`
			);
			bar.start(frames, 0);
		},
	});
	bar.stop();
	process.stdout.write('🧵 (3/3) Stitching frames together...\n');
	const outputLocation = absoluteOutputFile;
	await stitchFramesToVideo({
		dir: outputDir,
		width: config.width,
		height: config.height,
		fps: config.fps,
		outputLocation,
		force: overwrite,
	});
	console.log('\n▶️ Your video is ready - hit play!');
	console.log(outputLocation);
};
