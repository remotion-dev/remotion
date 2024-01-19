import type {LogLevel} from '@remotion/renderer';
import {chalk} from './chalk';
import {findEntryPoint} from './entry-point';
import {getCliOptions} from './get-cli-options';
import {Log} from './log';
import {quietFlagProvided} from './parse-command-line';
import {bundleOnCli} from './setup-cache';
import {shouldUseNonOverlayingLogger} from './should-use-non-overlaying-logger';

export const bundleCommand = async (
	remotionRoot: string,
	args: string[],
	logLevel: LogLevel,
) => {
	const {file, reason} = findEntryPoint(args, remotionRoot, logLevel);
	const explicitlyPassed = args[0];
	if (
		explicitlyPassed &&
		reason !== 'argument passed' &&
		reason !== 'argument passed - found in cwd' &&
		reason !== 'argument passed - found in root'
	) {
		Log.error(
			`Entry point was specified as ${chalk.bold(
				explicitlyPassed,
			)}, but it was not found.`,
		);
		process.exit(1);
	}

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
		quietFlag: quietFlagProvided(),
	});

	// TODO: Not + if already existed
	Log.infoAdvanced({indent: false, logLevel}, chalk.blue(`+ ${output}`));
};
