import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import {deleteFunction} from '../../../api/delete-function';
import {getFunctionInfo} from '../../../api/get-function-info';
import {getFunctions} from '../../../api/get-functions';
import {getAwsRegion} from '../../get-aws-region';
import {confirmCli} from '../../helpers/confirm';

export const FUNCTIONS_RMALL_SUBCOMMAND = 'rmall';
const LEFT_COL = 16;

export const functionsRmallCommand = async (logLevel: LogLevel) => {
	const region = getAwsRegion();
	const functions = await getFunctions({
		region,
		compatibleOnly: false,
	});

	for (const fun of functions) {
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
			functionName: fun.functionName,
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
			continue;
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
		await deleteFunction({region, functionName: fun.functionName});
		output.update('Deleted!', true);
	}
};
