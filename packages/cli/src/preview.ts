// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import {BundlerInternals} from '@remotion/bundler';
import betterOpn from 'better-opn';
import path from 'path';
import xns from 'xns';
import {getConfigFileName} from './get-config-file-name';
import {getInputProps} from './get-input-props';
import {loadConfigFile} from './load-config';
import {parsedCli} from './parse-command-line';

export const previewCommand = xns(async () => {
	const file = parsedCli._[1];
	const fullPath = path.join(process.cwd(), file);

	loadConfigFile(getConfigFileName());

	const inputProps = getInputProps();

	const port = await BundlerInternals.startServer(
		path.resolve(__dirname, 'previewEntry.js'),
		fullPath,
		{
			inputProps,
		}
	);
	betterOpn(`http://localhost:${port}`);
	await new Promise(() => void 0);
});
