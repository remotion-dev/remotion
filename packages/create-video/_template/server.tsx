/**
 * This is an example of a server that returns dynamic video.
 * Run `npm run server` to try it out!
 * If you don't want to render videos on a server, you can safely
 * delete this file.
 */

import {renderFrames, stitchFramesToVideo} from '@remotion/renderer';
import express from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {evaluateRootForCompositions} from 'remotion';

const app = express();
const port = 8000;
const videoName = 'HelloWorld';

const cache = new Map<string, string>();

app.get('/', async (req, res) => {
	const sendFile = (file: string) => {
		fs.createReadStream(file)
			.pipe(res)
			.on('close', () => {
				res.end();
			});
	};
	try {
		if (cache.get(JSON.stringify(req.query))) {
			sendFile(cache.get(JSON.stringify(req.query)) as string);
			return;
		}
		await import('./src/index');
		const comps = await evaluateRootForCompositions();
		const video = comps.find((c) => c.id === videoName);
		if (!video) {
			throw new Error(`No video called ${videoName}`);
		}
		res.set('content-type', 'video/mp4');

		const tmpDir = await fs.promises.mkdtemp(
			path.join(os.tmpdir(), 'remotion-')
		);
		await renderFrames({
			config: video,
			fullPath: require.resolve('./src/index'),
			onStart: () => console.log('Rendering frames...'),
			onFrameUpdate: (f) => {
				if (f % 10 === 0) {
					console.log(`Rendered frame ${f}`);
				}
			},
			parallelism: null,
			outputDir: tmpDir,
			userProps: req.query,
			videoName,
		});

		const finalOutput = path.join(tmpDir, `out.mp4`);
		await stitchFramesToVideo({
			dir: tmpDir,
			force: true,
			fps: video.fps,
			height: video.height,
			width: video.width,
			outputLocation: finalOutput,
		});
		cache.set(JSON.stringify(req.query), finalOutput);
		sendFile(finalOutput);
	} catch (err) {
		console.error(err);
		res.json({
			error: err,
		});
	}
});

app.listen(port);

console.log(
	[
		`The server has started on http://localhost:${port}!`,
		`You can render a video by passing props as URL parameters.`,
		'',
		`If you are running Hello World, try this:`,
		'',
		`http://localhost:${port}?titleText=Hello,+World!&titleColor=red`,
		'',
	].join('\n')
);
