import {startServer} from '@remotion/bundler';
// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import betterOpn from 'better-opn';
import path from 'path';
import xns from 'xns';
import {getConfigFileName} from './get-config-file-name';
import {getUserProps} from './get-user-props';
import {loadConfigFile} from './load-config';
import {parsedCli} from './parse-command-line';

export const previewCommand = xns(async () => {
	const file = parsedCli._[1];
	const fullPath = path.join(process.cwd(), file);

	loadConfigFile(getConfigFileName());

	const inputProps = getUserProps();

	const port = await startServer(
		path.resolve(__dirname, 'previewEntry.js'),
		fullPath,
		{
			inputProps,
		}
	);
	betterOpn(`http://localhost:${port}`);
	await new Promise(() => void 0);
});
