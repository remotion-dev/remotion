import {startServer} from '@jonny/motion-bundler';
import betterOpn from 'better-opn';
import path from 'path';
import xns from 'xns';

xns(async () => {
	const args = process.argv;
	const file = args[2];
	const fullPath = path.join(process.cwd(), file);

	const port = await startServer(
		path.resolve(__dirname, 'previewEntry.js'),
		fullPath
	);
	betterOpn(`http://localhost:${port}`);
	await new Promise(() => void 0);
});
