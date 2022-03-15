// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import {BundlerInternals} from '@remotion/bundler';
import betterOpn from 'better-opn';
import path from 'path';
import {Internals} from 'remotion';
import {getEnvironmentVariables} from './get-env';
import {getInputProps} from './get-input-props';
import {initializeRenderCli} from './initialize-render-cli';
import {parsedCli} from './parse-command-line';

const noop = () => undefined;

export const previewCommand = async () => {
	const file = parsedCli._[1];

	if (!file) {
		Log.error(
			'The preview command requires you to specify a root file. For example'
		);
		Log.error('  npx remotion preview src/index.tsx');
		Log.error(
			'See https://www.remotion.dev/docs/register-root for more information.'
		);
		process.exit(1);
	}

	const {port: desiredPort} = parsedCli;
	const fullPath = path.join(process.cwd(), file);

	await initializeRenderCli('preview');

	const inputProps = getInputProps();
	const envVariables = await getEnvironmentVariables();

	const port = await BundlerInternals.startServer(
		path.resolve(__dirname, 'previewEntry.js'),
		fullPath,
		{
			inputProps,
			envVariables,
			port: desiredPort,
			maxTimelineTracks: Internals.getMaxTimelineTracks(),
		}
	);
	betterOpn(`http://localhost:${port}`);
	await new Promise(noop);
};
