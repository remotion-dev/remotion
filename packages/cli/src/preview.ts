import {startServer} from '@remotion/bundler';
import betterOpn from 'better-opn';
import fs from 'fs';
import path from 'path';
import xns from 'xns';

xns(async () => {
	const args = process.argv;
	const file = args[2];
	const fullPath = path.join(process.cwd(), file);

	const tsxFile = path.resolve(__dirname, 'previewEntry.tsx');
	const jsFile = path.resolve(__dirname, 'previewEntry.js');

	const fileChosen = fs.existsSync(tsxFile) ? tsxFile : jsFile;

	const port = await startServer(fileChosen, fullPath);
	betterOpn(`http://localhost:${port}`);
	await new Promise(() => void 0);
});
