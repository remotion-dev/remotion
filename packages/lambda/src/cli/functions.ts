import {CliInternals} from '@remotion/cli';
import {Log} from '@remotion/cli/dist/log';
import {getDeployedLambdas} from '../api/get-deployed-lambdas';
import {getFunctionVersion} from '../api/get-function-version';
import {getAwsRegion} from './get-aws-region';

export const FUNCTIONS_COMMAND = 'functions';

const NAME_COLS = 32;
const MEMORY_COLS = 15;
const TIMEOUT_COLS = 15;
const VERSION_COLS = 15;

export const functionsCommand = async () => {
	const region = getAwsRegion();
	const functions = await getDeployedLambdas({
		region,
	});

	const configs = await Promise.all(
		functions.map((fn) => {
			return getFunctionVersion({
				functionName: fn.FunctionName as string,
				region,
			});
		})
	);
	const pluralized = functions.length === 1 ? 'function' : 'functions';
	Log.info(`${functions.length} ${pluralized} in the ${region} region:`);
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
				(datapoint.fn.FunctionName as string).padEnd(NAME_COLS, ' '),
				datapoint.config.padEnd(VERSION_COLS, ' '),
				String(datapoint.fn.MemorySize as number).padEnd(MEMORY_COLS, ' '),
				String(datapoint.fn.Timeout as number).padEnd(TIMEOUT_COLS, ' '),
			].join('')
		);
	}
};
