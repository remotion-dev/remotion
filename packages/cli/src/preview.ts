import {startServer} from '@remotion/bundler';
import betterOpn from 'better-opn';
import fs from 'fs';
import path from 'path';
import xns from 'xns';
import {getConfigFileName} from './get-config-file-name';
import {loadConfigFile} from './load-config';

export const previewCommand = xns(async () => {
	const args = process.argv;
	const file = args[3];
	const fullPath = path.join(process.cwd(), file);

	const tsxFile = path.resolve(__dirname, 'previewEntry.tsx');
	const jsFile = path.resolve(__dirname, 'previewEntry.js');
	loadConfigFile(getConfigFileName());

	const fileChosen = fs.existsSync(tsxFile) ? tsxFile : jsFile;

	const port = await startServer(fileChosen, fullPath);
	betterOpn(`http://localhost:${port}`);
	await new Promise(() => void 0);
});
