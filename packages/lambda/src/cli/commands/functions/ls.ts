import {CliInternals} from '@remotion/cli';
import {Log} from '@remotion/cli/dist/log';
import {getDeployedLambdas} from '../../../api/get-deployed-lambdas';
import {getFunctionVersion} from '../../../api/get-function-version';
import {getAwsRegion} from '../../get-aws-region';

const NAME_COLS = 32;
const MEMORY_COLS = 15;
const TIMEOUT_COLS = 15;
const VERSION_COLS = 15;

export const FUNCTIONS_LS_SUBCOMMAND = 'ls';

export const functionsLsCommand = async () => {
	const region = getAwsRegion();
	const fetchingOutput = CliInternals.createOverwriteableCliOutput();
	fetchingOutput.update('Getting functions...');
	const functions = await getDeployedLambdas({
		region,
	});
	fetchingOutput.update('Getting function info...');

	const configs = await Promise.all(
		functions.map((fn) => {
			return getFunctionVersion({
				functionName: fn.name,
				region,
			});
		})
	);
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
				'Memory (MB)'.padEnd(MEMORY_COLS, ' '),
				'Timeout (sec)'.padEnd(TIMEOUT_COLS, ' '),
			].join('')
		)
	);

	const info = functions.map((f, i) => {
		return {
			fn: f,
			config: configs[i],
		};
	});

	for (const datapoint of info) {
		Log.info(
			[
				datapoint.fn.name.padEnd(NAME_COLS, ' '),
				datapoint.config.padEnd(VERSION_COLS, ' '),
				String(datapoint.fn.memory).padEnd(MEMORY_COLS, ' '),
				String(datapoint.fn.timeout).padEnd(TIMEOUT_COLS, ' '),
			].join('')
		);
	}
};
