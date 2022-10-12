import {getCliOptions} from './get-cli-options';
import {initializeCli} from './initialize-cli';
import {Log} from './log';
import {parsedCli} from './parse-command-line';
import {prepareEntryPoint} from './prepare-entry-point';

export const bundleCommand = async (remotionRoot: string) => {
	const file = parsedCli._[1];

	if (!file) {
		Log.error('No entry point specified. Pass more arguments:');
		Log.error('   npx remotion bundle [entry-point]');
		Log.error('Documentation: https://www.remotion.dev/docs/cli/bundle');
		process.exit(1);
	}

	await initializeCli(remotionRoot);

	const {publicPath, bundleOutDir, publicDir} = await getCliOptions({
		isLambda: false,
		type: 'get-compositions-or-bundle',
		codec: 'h264',
	});

	const {urlOrBundle} = await prepareEntryPoint({
		file,
		otherSteps: [],
		outDir: bundleOutDir,
		publicPath,
		remotionRoot,
		publicDir,
	});

	Log.info();
	Log.info(urlOrBundle);
};
