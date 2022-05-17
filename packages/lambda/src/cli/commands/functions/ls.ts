import {CliInternals} from '@remotion/cli';
import {Log} from '@remotion/cli/dist/log';
import {getFunctions} from '../../../api/get-functions';
import {getAwsRegion} from '../../get-aws-region';

const NAME_COLS = 70;
const MEMORY_COLS = 15;
const DISK_COLS = 15;
const TIMEOUT_COLS = 15;
const VERSION_COLS = 15;

export const FUNCTIONS_LS_SUBCOMMAND = 'ls';

export const functionsLsCommand = async () => {
	const region = getAwsRegion();
	const fetchingOutput = CliInternals.createOverwriteableCliOutput(
		CliInternals.quietFlagProvided()
	);
	fetchingOutput.update('Getting functions...');

	const functions = await getFunctions({
		region,
		compatibleOnly: false,
	});

	if (CliInternals.quietFlagProvided()) {
		if (functions.length === 0) {
			Log.info('()');
			return;
		}

		Log.info(functions.map((f) => f.functionName).join(' '));
		return;
	}

	fetchingOutput.update('Getting function info...');

	const pluralized = functions.length === 1 ? 'function' : 'functions';
	fetchingOutput.update(
		`${functions.length} ${pluralized} in the ${region} region`
	);
	Log.info();
	Log.info(
		CliInternals.chalk.gray(
			[
				'Name'.padEnd(NAME_COLS, ' '),
				'Version'.padEnd(VERSION_COLS, ' '),
				'Disk (MB)'.padEnd(MEMORY_COLS, ' '),
				'Memory (MB)'.padEnd(MEMORY_COLS, ' '),
				'Timeout (sec)'.padEnd(TIMEOUT_COLS, ' '),
			].join('')
		)
	);

	for (const datapoint of functions) {
		Log.info(
			[
				datapoint.functionName.padEnd(NAME_COLS, ' '),
				datapoint.version
					? datapoint.version.padEnd(VERSION_COLS, ' ')
					: 'Error'.padEnd(VERSION_COLS, ' '),
				String(datapoint.diskSizeInMb).padEnd(DISK_COLS, ' '),
				String(datapoint.memorySizeInMb).padEnd(MEMORY_COLS, ' '),
				String(datapoint.timeoutInSeconds).padEnd(TIMEOUT_COLS, ' '),
			].join('')
		);
	}
};
