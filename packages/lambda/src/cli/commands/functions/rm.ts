import {CliInternals} from '@remotion/cli';
import {deleteFunction} from '@remotion/lambda-client';
import {BINARY_NAME} from '@remotion/lambda-client/constants';
import type {LogLevel} from '@remotion/renderer';
import {getFunctionInfo} from '../../../api/get-function-info';
import {getAwsRegion} from '../../get-aws-region';
import {confirmCli} from '../../helpers/confirm';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';
import {FUNCTIONS_COMMAND} from './index';
import {FUNCTIONS_LS_SUBCOMMAND} from './ls';

export const FUNCTIONS_RM_SUBCOMMAND = 'rm';
const LEFT_COL = 16;

export const functionsRmCommand = async (
	args: string[],
	logLevel: LogLevel,
) => {
	if (args.length === 0) {
		Log.error({indent: false, logLevel}, 'No function name passed.');
		Log.error(
			{indent: false, logLevel},
			'Pass another argument which is the name of the function you would like to remove.',
		);
		Log.info(
			{indent: false, logLevel},
			`You can run \`${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_LS_SUBCOMMAND}\` to see a list of deployed Lambda functions.`,
		);
		quit(1);
	}

	if (args[0] === '()') {
		Log.info({indent: false, logLevel}, 'No functions to remove.');
		return;
	}

	const region = getAwsRegion();

	for (const functionName of args) {
		const infoOutput = CliInternals.createOverwriteableCliOutput({
			quiet: CliInternals.quietFlagProvided(),
			cancelSignal: null,
			// No browser logs
			updatesDontOverwrite: false,
			indent: false,
		});
		infoOutput.update('Getting function info...', false);
		const info = await getFunctionInfo({
			region,
			functionName,
		});

		infoOutput.update(
			[
				'Function name: '.padEnd(LEFT_COL, ' ') + ' ' + info.functionName,
				'Memory: '.padEnd(LEFT_COL, ' ') + ' ' + info.memorySizeInMb + 'MB',
				'Timeout: '.padEnd(LEFT_COL, ' ') + ' ' + info.timeoutInSeconds + 'sec',
				'Version: '.padEnd(LEFT_COL, ' ') + ' ' + info.version,
			].join('\n'),
			true,
		);

		if (
			!(await confirmCli({delMessage: 'Delete? (Y/n)', allowForceFlag: true}))
		) {
			quit(1);
		}

		const output = CliInternals.createOverwriteableCliOutput({
			quiet: CliInternals.quietFlagProvided(),
			cancelSignal: null,
			updatesDontOverwrite: CliInternals.shouldUseNonOverlayingLogger({
				logLevel,
			}),
			indent: false,
		});
		output.update('Deleting...', false);
		await deleteFunction({region, functionName});
		output.update('Deleted!', true);
	}
};
