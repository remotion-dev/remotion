import {startServer} from '@remotion/bundler';
// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import betterOpn from 'better-opn';
import path from 'path';
import xns from 'xns';
import {getConfigFileName} from './get-config-file-name';
import {loadConfigFile} from './load-config';

export const previewCommand = xns(async () => {
	const args = process.argv;
	const file = args[3];
	const fullPath = path.join(process.cwd(), file);

	loadConfigFile(getConfigFileName());

	const port = await startServer(
		path.resolve(__dirname, 'previewEntry.js'),
		fullPath
	);
	betterOpn(`http://localhost:${port}`);
	await new Promise(() => void 0);
});
