import {CliInternals} from '@remotion/cli';
import {AwsProvider} from '@remotion/lambda-client';
import type {LogLevel} from '@remotion/renderer';
import {ProviderSpecifics} from '@remotion/serverless';
import {parsedLambdaCli} from '../../args';
import {getAwsRegion} from '../../get-aws-region';

const NAME_COLS = 70;
const MEMORY_COLS = 15;
const DISK_COLS = 15;
const TIMEOUT_COLS = 15;
const VERSION_COLS = 15;

export const FUNCTIONS_LS_SUBCOMMAND = 'ls';

export const functionsLsCommand = async ({
	logLevel,
	providerSpecifics,
}: {
	logLevel: LogLevel;
	providerSpecifics: ProviderSpecifics<AwsProvider>;
}) => {
	const region = getAwsRegion();
	const fetchingOutput = CliInternals.createOverwriteableCliOutput({
		quiet: CliInternals.quietFlagProvided(),
		cancelSignal: null,
		updatesDontOverwrite: CliInternals.shouldUseNonOverlayingLogger({
			logLevel,
		}),
		indent: false,
	});
	fetchingOutput.update('Getting functions...', false);

	const compatibleOnly = parsedLambdaCli['compatible-only'] || false;

	const functions = await providerSpecifics.getFunctions({
		region,
		compatibleOnly,
	});

	if (CliInternals.quietFlagProvided()) {
		if (functions.length === 0) {
			CliInternals.Log.info({indent: false, logLevel}, '()');
			return;
		}

		CliInternals.Log.info(
			{indent: false, logLevel},
			functions.map((f) => f.functionName).join(' '),
		);
		return;
	}

	fetchingOutput.update('Getting function info...', false);

	const pluralized = functions.length === 1 ? 'function' : 'functions';
	fetchingOutput.update(
		`${functions.length} ${pluralized} in the ${region} region`,
		true,
	);
	CliInternals.Log.info({indent: false, logLevel});
	CliInternals.Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray(
			[
				'Name'.padEnd(NAME_COLS, ' '),
				'Version'.padEnd(VERSION_COLS, ' '),
				'Disk (MB)'.padEnd(MEMORY_COLS, ' '),
				'Memory (MB)'.padEnd(MEMORY_COLS, ' '),
				'Timeout (sec)'.padEnd(TIMEOUT_COLS, ' '),
			].join(''),
		),
	);

	for (const datapoint of functions) {
		CliInternals.Log.info(
			{indent: false, logLevel},
			[
				datapoint.functionName.padEnd(NAME_COLS, ' '),
				datapoint.version
					? datapoint.version.padEnd(VERSION_COLS, ' ')
					: 'Error'.padEnd(VERSION_COLS, ' '),
				String(datapoint.diskSizeInMb).padEnd(DISK_COLS, ' '),
				String(datapoint.memorySizeInMb).padEnd(MEMORY_COLS, ' '),
				String(datapoint.timeoutInSeconds).padEnd(TIMEOUT_COLS, ' '),
			].join(''),
		);
	}
};
