import type {LogLevel} from '@remotion/renderer';
import {chalk} from './chalk';
import {findEntryPoint} from './entry-point';
import {getCliOptions} from './get-cli-options';
import {Log} from './log';
import {bundleOnCli} from './setup-cache';
import {shouldUseNonOverlayingLogger} from './should-use-non-overlaying-logger';

export const bundleCommand = async (
	remotionRoot: string,
	args: string[],
	logLevel: LogLevel,
) => {
	const {file} = findEntryPoint(args, remotionRoot, logLevel);

	const updatesDontOverwrite = shouldUseNonOverlayingLogger({logLevel});

	if (!file) {
		// TODO: Proper error handling
		throw new Error('No file found');
	}

	const {publicDir} = await getCliOptions({
		isLambda: false,
		type: 'get-compositions',
		remotionRoot,
		logLevel,
	});

	const output = await bundleOnCli({
		fullPath: file,
		logLevel,
		onDirectoryCreated: () => {},
		bundlingStep: 0,
		indent: false,
		quietProgress: updatesDontOverwrite,
		publicDir,
		steps: 1,
		remotionRoot,
		onProgressCallback: () => {},
	});

	// TODO: Not + if already existed
	Log.infoAdvanced({indent: false, logLevel}, chalk.blue(`+ ${output}`));
};
